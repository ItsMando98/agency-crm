import { describe, expect, it, vi } from 'vitest';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { buildLlmResult } from 'src/__mocks__/build-llm-result.mock';
import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { AI_ENGINES, AI_REQUEST_TIMEOUT_MS } from 'src/constants/ai-visibility.const';
import { fetchAiAnswer } from 'src/dataforseo-client/fetch-ai-answer';

const CREDENTIALS = { login: 'login', password: 'password' };
const [CHATGPT, PERPLEXITY, GEMINI] = AI_ENGINES;

describe('fetchAiAnswer', () => {
  it('asks ChatGPT with web search and parses the answer and the cost', async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(buildLlmResult({ sourceUrls: ['https://rival.de/'] }), { cost: 0.02 }),
    }));

    const { answer, cost } = await fetchAiAnswer({
      credentials: CREDENTIALS,
      engine: CHATGPT,
      query: 'Welche Agentur hilft bei SEO?',
      fetchImplementation,
    });

    expect(requests[0].url).toBe('https://api.dataforseo.com/v3/ai_optimization/chat_gpt/llm_responses/live');
    expect(requests[0].body).toEqual([
      { user_prompt: 'Welche Agentur hilft bei SEO?', model_name: 'gpt-5.4-mini', web_search: true },
    ]);
    expect(timeoutSpy).toHaveBeenCalledWith(AI_REQUEST_TIMEOUT_MS);
    expect(answer?.sources).toEqual([{ url: 'https://rival.de/', title: null }]);
    expect(cost).toBe(0.02);
    timeoutSpy.mockRestore();
  });

  it('does not send the web search flag to Perplexity, which always searches', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(buildLlmResult()),
    }));

    await fetchAiAnswer({ credentials: CREDENTIALS, engine: PERPLEXITY, query: 'Frage', fetchImplementation });

    expect(requests[0].url).toContain('/perplexity/llm_responses/live');
    expect(requests[0].body).toEqual([{ user_prompt: 'Frage', model_name: 'sonar' }]);
  });

  it('asks Gemini with web search', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(buildLlmResult()),
    }));

    await fetchAiAnswer({ credentials: CREDENTIALS, engine: GEMINI, query: 'Frage', fetchImplementation });

    expect(requests[0].url).toContain('/gemini/llm_responses/live');
    expect(requests[0].body).toEqual([{ user_prompt: 'Frage', model_name: 'gemini-3.5-flash', web_search: true }]);
  });

  it('returns no answer when the response holds no message', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope({ items: [{ type: 'reasoning' }] }),
    }));

    const { answer } = await fetchAiAnswer({
      credentials: CREDENTIALS,
      engine: CHATGPT,
      query: 'Frage',
      fetchImplementation,
    });

    expect(answer).toBeNull();
  });

  it('throws the DataForSEO error so the caller can note it', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(null, { taskStatusCode: 40501, statusMessage: 'Invalid Field: model_name.' }),
    }));

    await expect(
      fetchAiAnswer({ credentials: CREDENTIALS, engine: CHATGPT, query: 'Frage', fetchImplementation }),
    ).rejects.toThrow('Invalid Field: model_name.');
  });
});
