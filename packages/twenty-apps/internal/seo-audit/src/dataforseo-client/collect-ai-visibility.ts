import {
  AI_DEADLINE_MS,
  AI_ENGINES,
  AI_MAX_ATTEMPTS,
  AI_MAX_ATTEMPTS_WHEN_TOLD_TO_WAIT,
  AI_MAX_RETRY_AFTER_MS,
  AI_MAX_COMPETITORS_SHOWN,
  AI_MAX_REQUESTS,
  AI_MENTIONED_WEIGHT,
  AI_REQUEST_CONCURRENCY,
  AI_RETRY_DELAY_MS,
  AI_RETRYABLE_ERROR_PATTERN,
} from 'src/constants/ai-visibility.const';
import {
  type AiAnswer,
  type AiAnswerStatus,
  type AiEngineId,
  type AiVisibility,
  type AiVisibilityRow,
} from 'src/types/ai-visibility';
import { classifyAiAnswer } from 'src/utils/classify-ai-answer.util';
import { runWithConcurrency } from 'src/utils/run-with-concurrency.util';

type Engine = (typeof AI_ENGINES)[number];

export type FetchAiAnswer = (params: {
  engine: Engine;
  query: string;
}) => Promise<{ answer: AiAnswer | null; cost: number }>;

type CollectAiVisibilityParams = {
  fetchAnswer: FetchAiAnswer;
  queries: string[];
  ownDomain: string;
  brandNames: string[];
  now: Date;
  deadlineMs?: number;
  maxRequests?: number;
  retryDelayMs?: number;
  concurrency?: number;
};

type Task = { query: string; engine: Engine };
type Outcome =
  | { task: Task; kind: 'ANSWERED'; status: AiAnswerStatus; competitorDomains: string[]; cost: number }
  | { task: Task; kind: 'FAILED'; message: string }
  | { task: Task; kind: 'SKIPPED'; reason: 'DEADLINE' | 'REQUEST_LIMIT' };

const readRetryAfterMs = (error: unknown): number | null => {
  const value = (error as { retryAfterMs?: unknown } | null)?.retryAfterMs;

  return typeof value === 'number' && value > 0 ? value : null;
};

// How long to wait before the next try, and how many tries are allowed.
export const planRetry = ({
  error,
  attempt,
  baseDelayMs,
}: {
  error: unknown;
  attempt: number;
  baseDelayMs: number;
}): { delayMs: number; maxAttempts: number } => {
  const retryAfterMs = readRetryAfterMs(error);

  return retryAfterMs === null
    ? { delayMs: baseDelayMs * attempt, maxAttempts: AI_MAX_ATTEMPTS }
    : {
        delayMs: Math.min(retryAfterMs, AI_MAX_RETRY_AFTER_MS),
        maxAttempts: AI_MAX_ATTEMPTS_WHEN_TOLD_TO_WAIT,
      };
};

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const describeSkipped = (
  count: number,
  reason: 'DEADLINE' | 'REQUEST_LIMIT',
  maxRequests: number,
): string => {
  const subject = count === 1 ? '1 request was' : `${count} requests were`;

  return reason === 'DEADLINE'
    ? `${subject} skipped because the time budget ran out.`
    : `${subject} skipped because the request limit of ${maxRequests} was reached.`;
};

const buildRow = (query: string, outcomes: Outcome[]): AiVisibilityRow => {
  const results = Object.fromEntries(
    AI_ENGINES.map(({ id }) => {
      const outcome = outcomes.find((candidate) => candidate.task.engine.id === id);

      return [id, outcome?.kind === 'ANSWERED' ? outcome.status : 'UNKNOWN'];
    }),
  ) as Record<AiEngineId, AiAnswerStatus>;
  const counts = new Map<string, number>();

  outcomes.forEach((outcome) => {
    if (outcome.kind === 'ANSWERED') {
      outcome.competitorDomains.forEach((domain) =>
        counts.set(domain, (counts.get(domain) ?? 0) + 1),
      );
    }
  });

  return {
    query,
    results,
    instead: [...counts.entries()]
      .sort((first, second) => second[1] - first[1])
      .slice(0, AI_MAX_COMPETITORS_SHOWN)
      .map(([domain]) => domain),
  };
};

const computePresenceRate = (rows: AiVisibilityRow[]): number | null => {
  const statuses = rows
    .flatMap((row) => Object.values(row.results))
    .filter((status) => status !== 'UNKNOWN');

  if (statuses.length === 0) {
    return null;
  }

  const weighted = statuses.reduce(
    (sum, status) =>
      sum + (status === 'CITED' ? 1 : status === 'MENTIONED' ? AI_MENTIONED_WEIGHT : 0),
    0,
  );

  return weighted / statuses.length;
};

// Each request fails on its own, so one engine going down costs only its column.
export const collectAiVisibility = async ({
  fetchAnswer,
  queries,
  ownDomain,
  brandNames,
  now,
  deadlineMs = AI_DEADLINE_MS,
  maxRequests = AI_MAX_REQUESTS,
  retryDelayMs = AI_RETRY_DELAY_MS,
  concurrency = AI_REQUEST_CONCURRENCY,
}: CollectAiVisibilityParams): Promise<AiVisibility> => {
  const tasks: Task[] = queries.flatMap((query) =>
    AI_ENGINES.map((engine) => ({ query, engine })),
  );
  const deadline = Date.now() + deadlineMs;
  let startedRequests = 0;

  const outcomes = await runWithConcurrency<Task, Outcome>(
    tasks,
    concurrency,
    async (task) => {
      if (Date.now() >= deadline) {
        return { task, kind: 'SKIPPED', reason: 'DEADLINE' };
      }

      if (startedRequests >= maxRequests) {
        return { task, kind: 'SKIPPED', reason: 'REQUEST_LIMIT' };
      }

      startedRequests += 1;

      let attempt = 0;

      for (;;) {
        attempt += 1;

        try {
          const { answer, cost } = await fetchAnswer({
            engine: task.engine,
            query: task.query,
          });

          return {
            task,
            kind: 'ANSWERED',
            cost,
            ...classifyAiAnswer({ answer, ownDomain, brandNames }),
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'request failed';
          const retry = planRetry({ error, attempt, baseDelayMs: retryDelayMs });
          const canTryAgain =
            attempt < retry.maxAttempts &&
            AI_RETRYABLE_ERROR_PATTERN.test(message) &&
            Date.now() < deadline;

          if (!canTryAgain) {
            return { task, kind: 'FAILED', message };
          }

          await wait(retry.delayMs);
        }
      }
    },
  );

  const rows = queries.map((query) =>
    buildRow(query, outcomes.filter((outcome) => outcome.task.query === query)),
  );
  const notes: string[] = [];

  for (const { id, label } of AI_ENGINES) {
    const firstFailure = outcomes.find(
      (outcome) => outcome.kind === 'FAILED' && outcome.task.engine.id === id,
    );

    if (firstFailure?.kind === 'FAILED') {
      notes.push(`${label}: ${firstFailure.message}`);
    }
  }

  for (const reason of ['DEADLINE', 'REQUEST_LIMIT'] as const) {
    const skippedCount = outcomes.filter(
      (outcome) => outcome.kind === 'SKIPPED' && outcome.reason === reason,
    ).length;

    if (skippedCount > 0) {
      notes.push(describeSkipped(skippedCount, reason, maxRequests));
    }
  }

  return {
    rows,
    engines: AI_ENGINES.map(({ id }) => id),
    presenceRate: computePresenceRate(rows),
    queriesTested: rows.filter((row) =>
      Object.values(row.results).some((status) => status !== 'UNKNOWN'),
    ).length,
    testedAt: now.toISOString(),
    costUsd: outcomes.reduce(
      (sum, outcome) => sum + (outcome.kind === 'ANSWERED' ? outcome.cost : 0),
      0,
    ),
    notes,
  };
};
