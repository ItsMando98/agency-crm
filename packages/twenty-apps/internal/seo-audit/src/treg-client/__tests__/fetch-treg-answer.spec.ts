import { describe, expect, it } from 'vitest';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { buildLlmResult } from 'src/__mocks__/build-llm-result.mock';
import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { AI_ENGINES } from 'src/constants/ai-visibility.const';
import { fetchTregAnswer } from 'src/treg-client/fetch-treg-answer';

const [CHATGPT, PERPLEXITY, GEMINI] = AI_ENGINES;
const CREDENTIALS = { token: 'tok_123', organization: null };
const QUERY = 'Welche Agentur hilft bei SEO?';

const cloroResponse = {
  success: true,
  result: {
    text: 'Eine ausführliche Antwort über Agenturen.',
    sources: [{ position: 1, label: 'Quelle', url: 'https://rival.de/', footnote: false }],
    citationPills: [],
  },
};

const respondWith = (json: unknown, headers: Record<string, string> = {}) =>
  createRecordingFetch(() => ({ json, headers }));

describe('fetchTregAnswer', () => {
  it('asks ChatGPT through cloro and reads the cost from the header', async () => {
    const { fetchImplementation, requests } = respondWith(cloroResponse, { 'x-treg-cost-micro': '2800' });

    const { answer, cost } = await fetchTregAnswer({
      credentials: CREDENTIALS,
      engine: CHATGPT,
      query: QUERY,
      countryCode: 'DE',
      fetchImplementation,
    });

    expect(requests[0].url).toBe('https://treg.to/call/cloro.ai-search.chatgpt.scrape');
    expect(requests[0].method).toBe('POST');
    expect(requests[0].headers['x-treg-token']).toBe('tok_123');
    expect(requests[0].headers['x-treg-org']).toBeUndefined();
    expect(requests[0].headers['x-treg-route-max-cost']).toBe('0.05');
    expect(requests[0].body).toEqual({ prompt: QUERY, country: 'DE' });
    expect(answer).toEqual({
      text: 'Eine ausführliche Antwort über Agenturen.',
      sources: [{ url: 'https://rival.de/', title: 'Quelle' }],
    });
    expect(cost).toBeCloseTo(0.0028);
  });

  it('sends the team when one is configured', async () => {
    const { fetchImplementation, requests } = respondWith(cloroResponse);

    await fetchTregAnswer({
      credentials: { token: 'tok_123', organization: 'landoo' },
      engine: CHATGPT,
      query: QUERY,
      countryCode: 'DE',
      fetchImplementation,
    });

    expect(requests[0].headers['x-treg-org']).toBe('landoo');
  });

  it('asks Gemini through cloro', async () => {
    const { fetchImplementation, requests } = respondWith(cloroResponse);

    await fetchTregAnswer({ credentials: CREDENTIALS, engine: GEMINI, query: QUERY, countryCode: 'AT', fetchImplementation });

    expect(requests[0].url).toBe('https://treg.to/call/cloro.ai-search.gemini.scrape');
    expect(requests[0].body).toEqual({ prompt: QUERY, country: 'AT' });
  });

  it('asks Perplexity through the DataForSEO endpoint that treg serves', async () => {
    const { fetchImplementation, requests } = respondWith(
      buildDataForSeoEnvelope(buildLlmResult({ sourceUrls: ['https://rival.de/'] })),
      { 'x-treg-cost-micro': '5861' },
    );

    const { answer, cost } = await fetchTregAnswer({
      credentials: CREDENTIALS,
      engine: PERPLEXITY,
      query: QUERY,
      countryCode: 'DE',
      fetchImplementation,
    });

    expect(requests[0].url).toBe('https://treg.to/call/dataforseo.x.ai-optimization-perplexity-llm-responses-live');
    expect(requests[0].body).toEqual([{ user_prompt: QUERY, model_name: 'sonar', web_search_country_iso_code: 'DE' }]);
    expect(answer?.sources).toEqual([{ url: 'https://rival.de/', title: null }]);
    expect(cost).toBeCloseTo(0.005861);
  });

  it('says that the balance is too low and where to top up', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      status: 402,
      json: { error: 'insufficient_balance', topup_url: 'https://treg.to/topup' },
    }));

    await expect(
      fetchTregAnswer({ credentials: CREDENTIALS, engine: CHATGPT, query: QUERY, countryCode: 'DE', fetchImplementation }),
    ).rejects.toThrow('The treg balance is too low. Top up at https://treg.to/topup');
  });

  it('reports a saturated treg so the caller can try again', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      status: 503,
      json: { error: 'treg_saturated' },
    }));

    await expect(
      fetchTregAnswer({ credentials: CREDENTIALS, engine: CHATGPT, query: QUERY, countryCode: 'DE', fetchImplementation }),
    ).rejects.toThrow(/saturated/);
  });

  it('reports a rejected token', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      status: 401,
      json: { error: 'invalid_token' },
    }));

    await expect(
      fetchTregAnswer({ credentials: CREDENTIALS, engine: CHATGPT, query: QUERY, countryCode: 'DE', fetchImplementation }),
    ).rejects.toThrow('treg rejected the token (HTTP 401).');
  });

  it('reports a failure that cloro sends inside a 200 response', async () => {
    const { fetchImplementation } = respondWith({ success: false, error: 'prompt blocked' });

    await expect(
      fetchTregAnswer({ credentials: CREDENTIALS, engine: CHATGPT, query: QUERY, countryCode: 'DE', fetchImplementation }),
    ).rejects.toThrow('cloro: prompt blocked');
  });
});
