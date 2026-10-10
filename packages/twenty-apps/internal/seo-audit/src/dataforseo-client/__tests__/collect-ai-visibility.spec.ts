import { describe, expect, it } from 'vitest';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { buildLlmResult } from 'src/__mocks__/build-llm-result.mock';
import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { collectAiVisibility } from 'src/dataforseo-client/collect-ai-visibility';
import { fetchAiAnswer } from 'src/dataforseo-client/fetch-ai-answer';

const NOW = new Date('2026-10-09T10:00:00Z');
const CREDENTIALS = { login: 'login', password: 'password' };
const PARAMS = {
  ownDomain: 'kanzlei-beispiel.de',
  brandNames: ['kanzlei-beispiel', 'kanzlei beispiel'],
  now: NOW,
};

const throughDataForSeo =
  (fetchImplementation: typeof fetch) =>
  ({ engine, query }: { engine: Parameters<typeof fetchAiAnswer>[0]['engine']; query: string }) =>
    fetchAiAnswer({ credentials: CREDENTIALS, engine, query, fetchImplementation });

const respondByEngine =
  (byEngine: { chat_gpt?: unknown; perplexity?: unknown; gemini?: unknown }, cost = 0.01) =>
  ({ url }: { url: string }) => {
    const engine = (['chat_gpt', 'perplexity', 'gemini'] as const).find((name) => url.includes(`/${name}/`));

    return { json: buildDataForSeoEnvelope(engine === undefined ? null : byEngine[engine], { cost }) };
  };

describe('collectAiVisibility', () => {
  it('asks every question in every engine and judges each answer', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(
      respondByEngine({
        chat_gpt: buildLlmResult({ sourceUrls: ['https://www.kanzlei-beispiel.de/a', 'https://rival.de/'] }),
        perplexity: buildLlmResult({ text: 'Auch Kanzlei Beispiel wird oft genannt in Berlin.', sourceUrls: ['https://rival.de/'] }),
        gemini: buildLlmResult({ sourceUrls: ['https://rival.de/', 'https://other.de/'] }),
      }),
    );

    const visibility = await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?', 'Frage zwei zur Kanzlei?'],
      fetchAnswer: throughDataForSeo(fetchImplementation),
    });

    expect(requests).toHaveLength(6);
    expect(visibility.engines).toEqual(['CHATGPT', 'PERPLEXITY', 'GEMINI']);
    expect(visibility.testedAt).toBe('2026-10-09T10:00:00.000Z');
    expect(visibility.rows[0]).toEqual({
      query: 'Frage eins zur Kanzlei?',
      results: { CHATGPT: 'CITED', PERPLEXITY: 'MENTIONED', GEMINI: 'ABSENT' },
      instead: ['rival.de', 'other.de'],
    });
    expect(visibility.queriesTested).toBe(2);
    expect(visibility.presenceRate).toBeCloseTo(0.5);
    expect(visibility.costUsd).toBeCloseTo(0.06);
    expect(visibility.notes).toEqual([]);
  });

  it('leaves answers it cannot judge out of the presence rate', async () => {
    const { fetchImplementation } = createRecordingFetch(
      respondByEngine({
        chat_gpt: buildLlmResult({ sourceUrls: ['https://kanzlei-beispiel.de/'] }),
        perplexity: { items: [{ type: 'reasoning' }] },
        gemini: buildLlmResult({ text: 'kurz' }),
      }),
    );

    const visibility = await collectAiVisibility({ ...PARAMS, queries: ['Frage eins zur Kanzlei?'], fetchAnswer: throughDataForSeo(fetchImplementation) });

    expect(visibility.rows[0].results).toEqual({ CHATGPT: 'CITED', PERPLEXITY: 'UNKNOWN', GEMINI: 'UNKNOWN' });
    expect(visibility.presenceRate).toBe(1);
  });

  it('has no presence rate when nothing could be judged', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(null, { taskStatusCode: 40501, statusMessage: 'Invalid Field: model_name.' }),
    }));

    const visibility = await collectAiVisibility({ ...PARAMS, queries: ['Frage eins zur Kanzlei?'], fetchAnswer: throughDataForSeo(fetchImplementation) });

    expect(visibility.presenceRate).toBeNull();
    expect(visibility.queriesTested).toBe(0);
    expect(visibility.costUsd).toBe(0);
    expect(visibility.notes).toEqual([
      'ChatGPT: Invalid Field: model_name.',
      'Perplexity: Invalid Field: model_name.',
      'Gemini: Invalid Field: model_name.',
    ]);
  });

  it('notes a failing engine once and keeps the others', async () => {
    const { fetchImplementation } = createRecordingFetch(({ url }) =>
      url.includes('/gemini/')
        ? { json: buildDataForSeoEnvelope(null, { taskStatusCode: 50000, statusMessage: 'Gemini is down.' }) }
        : { json: buildDataForSeoEnvelope(buildLlmResult({ sourceUrls: ['https://rival.de/'] })) },
    );

    const visibility = await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?', 'Frage zwei zur Kanzlei?'],
      fetchAnswer: throughDataForSeo(fetchImplementation),
    });

    expect(visibility.notes).toEqual(['Gemini: Gemini is down.']);
    expect(visibility.rows.map((row) => row.results.GEMINI)).toEqual(['UNKNOWN', 'UNKNOWN']);
    expect(visibility.rows.map((row) => row.results.CHATGPT)).toEqual(['ABSENT', 'ABSENT']);
  });

  it('asks a rate limited engine again after a pause and keeps the answer', async () => {
    let geminiAttempts = 0;
    const { fetchImplementation, requests } = createRecordingFetch(({ url }) => {
      if (!url.includes('/gemini/')) {
        return { json: buildDataForSeoEnvelope(buildLlmResult({ sourceUrls: ['https://rival.de/'] })) };
      }

      geminiAttempts += 1;

      return geminiAttempts === 1
        ? {
            json: buildDataForSeoEnvelope(null, {
              taskStatusCode: 50000,
              statusMessage: '3rd Party API Service Unavailable (rate_limit_exceeded).',
            }),
          }
        : { json: buildDataForSeoEnvelope(buildLlmResult({ sourceUrls: ['https://www.kanzlei-beispiel.de/'] })) };
    });

    const visibility = await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?'],
      retryDelayMs: 0,
      fetchAnswer: throughDataForSeo(fetchImplementation),
    });

    expect(requests.filter((request) => request.url.includes('/gemini/'))).toHaveLength(2);
    expect(visibility.rows[0].results.GEMINI).toBe('CITED');
    expect(visibility.notes).toEqual([]);
  });

  it('gives up after three attempts and notes the engine once', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(({ url }) =>
      url.includes('/gemini/')
        ? {
            json: buildDataForSeoEnvelope(null, {
              taskStatusCode: 50000,
              statusMessage: '3rd Party API Service Unavailable (rate_limit_exceeded).',
            }),
          }
        : { json: buildDataForSeoEnvelope(buildLlmResult()) },
    );

    const visibility = await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?', 'Frage zwei zur Kanzlei?'],
      retryDelayMs: 0,
      fetchAnswer: throughDataForSeo(fetchImplementation),
    });

    expect(requests.filter((request) => request.url.includes('/gemini/'))).toHaveLength(6);
    expect(visibility.rows.map((row) => row.results.GEMINI)).toEqual(['UNKNOWN', 'UNKNOWN']);
    expect(visibility.notes).toEqual(['Gemini: 3rd Party API Service Unavailable (rate_limit_exceeded).']);
  });

  it('does not ask again after an error that more attempts cannot fix', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(null, { taskStatusCode: 40501, statusMessage: 'Invalid Field: model_name.' }),
    }));

    await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?'],
      retryDelayMs: 0,
      fetchAnswer: throughDataForSeo(fetchImplementation),
    });

    expect(requests).toHaveLength(3);
  });

  it('uses the injected answer source and the given concurrency', async () => {
    let running = 0;
    let highest = 0;
    const fetchAnswer = async () => {
      running += 1;
      highest = Math.max(highest, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;

      return { answer: { text: 'Antwort', sources: [] }, cost: 0.003 };
    };

    const visibility = await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?', 'Frage zwei zur Kanzlei?'],
      concurrency: 2,
      fetchAnswer,
    });

    expect(highest).toBe(2);
    expect(visibility.costUsd).toBeCloseTo(0.018);
  });

  it('asks again after a timeout and keeps the answer', async () => {
    let attempts = 0;
    const fetchAnswer = async () => {
      attempts += 1;

      if (attempts === 1) {
        throw new Error('The operation was aborted due to timeout');
      }

      return { answer: { text: 'Antwort', sources: [] }, cost: 0.003 };
    };

    const visibility = await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?'],
      retryDelayMs: 0,
      fetchAnswer,
    });

    expect(attempts).toBe(4);
    expect(visibility.notes).toEqual([]);
  });

  it('stops asking once the request limit is used up', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(
      respondByEngine({ chat_gpt: buildLlmResult(), perplexity: buildLlmResult(), gemini: buildLlmResult() }),
    );

    const visibility = await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?', 'Frage zwei zur Kanzlei?'],
      maxRequests: 4,
      fetchAnswer: throughDataForSeo(fetchImplementation),
    });

    expect(requests).toHaveLength(4);
    expect(visibility.notes).toEqual(['2 requests were skipped because the request limit of 4 was reached.']);
  });

  it('skips the remaining requests once the time budget is used up', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(
      respondByEngine({ chat_gpt: buildLlmResult(), perplexity: buildLlmResult(), gemini: buildLlmResult() }),
    );

    const visibility = await collectAiVisibility({
      ...PARAMS,
      queries: ['Frage eins zur Kanzlei?'],
      deadlineMs: -1,
      fetchAnswer: throughDataForSeo(fetchImplementation),
    });

    expect(requests).toHaveLength(0);
    expect(visibility.presenceRate).toBeNull();
    expect(visibility.notes).toEqual(['3 requests were skipped because the time budget ran out.']);
  });
});
