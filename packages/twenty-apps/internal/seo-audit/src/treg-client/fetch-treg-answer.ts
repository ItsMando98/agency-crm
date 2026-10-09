import {
  AI_TREG_ENDPOINTS,
  TREG_BASE_URL,
  TREG_MAX_COST_PER_CALL_USD,
  TREG_REQUEST_TIMEOUT_MS,
  type AI_ENGINES,
} from 'src/constants/ai-visibility.const';
import { type AiAnswer } from 'src/types/ai-visibility';
import { type TregCredentials } from 'src/types/treg-credentials';
import { asRecord } from 'src/utils/as-record.util';
import { parseAiAnswer } from 'src/utils/parse-ai-answer.util';
import { parseCloroAnswer } from 'src/utils/parse-cloro-answer.util';

type FetchTregAnswerParams = {
  credentials: TregCredentials;
  engine: (typeof AI_ENGINES)[number];
  query: string;
  countryCode: string;
  fetchImplementation?: typeof fetch;
};

const MICRO_USD_PER_USD = 1_000_000;
const DATAFORSEO_SUCCESS_STATUS_CODE = 20000;
const PERPLEXITY_MODEL_NAME = 'sonar';

const buildBody = (
  engineId: (typeof AI_ENGINES)[number]['id'],
  query: string,
  countryCode: string,
): unknown =>
  engineId === 'PERPLEXITY'
    ? [
        {
          user_prompt: query,
          model_name: PERPLEXITY_MODEL_NAME,
          web_search_country_iso_code: countryCode,
        },
      ]
    : { prompt: query, country: countryCode };

const readErrorText = (payload: unknown): string | null => {
  const error = asRecord(payload)?.error;

  if (typeof error === 'string') {
    return error;
  }

  const message = asRecord(error)?.message;

  return typeof message === 'string' ? message : null;
};

const describeHttpFailure = (status: number, payload: unknown): string => {
  const errorText = readErrorText(payload);

  if (status === 401 || status === 403) {
    return `treg rejected the token (HTTP ${status}).`;
  }

  if (status === 402) {
    const topUpUrl = asRecord(payload)?.topup_url;

    return typeof topUpUrl === 'string'
      ? `The treg balance is too low. Top up at ${topUpUrl}`
      : 'The treg balance is too low. Top up the balance at treg.to.';
  }

  if (status === 429) {
    return 'treg rate limit reached (HTTP 429).';
  }

  if (status === 503) {
    return `treg is saturated or the provider is unavailable (${errorText ?? 'HTTP 503'}). Try again shortly.`;
  }

  return `treg returned HTTP ${status}${errorText === null ? '' : `: ${errorText}`}`;
};

const parsePerplexityEnvelope = (payload: unknown): AiAnswer | null => {
  const task = asRecord(
    (Array.isArray(asRecord(payload)?.tasks) ? (asRecord(payload)?.tasks as unknown[]) : [])[0],
  );

  if (task !== null && task.status_code !== DATAFORSEO_SUCCESS_STATUS_CODE) {
    throw new Error(
      `DataForSEO through treg: ${typeof task.status_message === 'string' ? task.status_message : 'request failed'}`,
    );
  }

  const results = Array.isArray(task?.result) ? (task.result as unknown[]) : [];

  return parseAiAnswer(results[0]);
};

export const fetchTregAnswer = async ({
  credentials,
  engine,
  query,
  countryCode,
  fetchImplementation = fetch,
}: FetchTregAnswerParams): Promise<{ answer: AiAnswer | null; cost: number }> => {
  const response = await fetchImplementation(
    `${TREG_BASE_URL}/call/${AI_TREG_ENDPOINTS[engine.id]}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-treg-token': credentials.token,
        'x-treg-route-max-cost': TREG_MAX_COST_PER_CALL_USD,
        ...(credentials.organization === null
          ? {}
          : { 'x-treg-org': credentials.organization }),
      },
      body: JSON.stringify(buildBody(engine.id, query, countryCode)),
      signal: AbortSignal.timeout(TREG_REQUEST_TIMEOUT_MS),
    },
  );

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(describeHttpFailure(response.status, payload));
  }

  const costMicro = Number(response.headers.get('x-treg-cost-micro'));
  const cost = Number.isFinite(costMicro) ? costMicro / MICRO_USD_PER_USD : 0;

  if (engine.id === 'PERPLEXITY') {
    return { answer: parsePerplexityEnvelope(payload), cost };
  }

  if (asRecord(payload)?.success === false) {
    throw new Error(`cloro: ${readErrorText(payload) ?? 'the request failed'}`);
  }

  return { answer: parseCloroAnswer(payload), cost };
};
