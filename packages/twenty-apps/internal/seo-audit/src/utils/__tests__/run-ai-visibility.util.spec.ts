import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { buildLlmResult } from 'src/__mocks__/build-llm-result.mock';
import { buildTextMessage, createFakeAnthropicClient } from 'src/__mocks__/create-fake-anthropic-client.mock';
import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { runAiVisibility } from 'src/utils/run-ai-visibility.util';

const NOW = new Date('2026-10-09T10:00:00Z');
const QUERIES = Array.from({ length: 10 }, (_, index) => `Welcher Anwalt hilft bei Kündigung Fall ${index}?`);
const homepage = buildCrawledPage({ url: 'https://kanzlei-beispiel.de/', title: 'Start', metaDescription: 'Anwälte' });

const buildParams = (overrides: Partial<Parameters<typeof runAiVisibility>[0]> = {}) => ({
  isEnabled: true,
  anthropicClient: createFakeAnthropicClient(() => buildTextMessage({ queries: QUERIES })).client,
  credentials: { login: 'login', password: 'password' },
  tregCredentials: null,
  origin: 'https://www.kanzlei-beispiel.de',
  homepage,
  auditablePages: [homepage],
  siteProfile: { businessModel: 'LOCAL_SERVICE' as const, servesLocalArea: true, confidence: 0.9 },
  market: 'DE' as const,
  now: NOW,
  ...overrides,
});

describe('runAiVisibility', () => {
  it('does nothing when the feature is switched off', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({ json: buildDataForSeoEnvelope(null) }));

    expect(await runAiVisibility(buildParams({ isEnabled: false, fetchImplementation }))).toBeNull();
    expect(requests).toHaveLength(0);
  });

  it('generates the questions, asks every engine and judges the answers', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(buildLlmResult({ sourceUrls: ['https://www.kanzlei-beispiel.de/a', 'https://rival.de/'] })),
    }));

    const visibility = await runAiVisibility(buildParams({ fetchImplementation }));

    expect(visibility?.rows).toHaveLength(8);
    expect(visibility?.rows[0].query).toBe(QUERIES[0]);
    expect(requests).toHaveLength(24);
    expect(visibility?.presenceRate).toBe(1);
    expect(visibility?.queriesTested).toBe(8);
    expect(visibility?.notes).toEqual([]);
  });

  it('asks through treg when a treg token is set, with the country of the market', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(({ url }) =>
      url.includes('perplexity')
        ? { json: buildDataForSeoEnvelope(buildLlmResult({ sourceUrls: ['https://rival.de/'] })) }
        : { json: { success: true, result: { text: 'Antwort', sources: [{ url: 'https://www.kanzlei-beispiel.de/a', label: '' }] } } },
    );

    const visibility = await runAiVisibility(
      buildParams({
        credentials: null,
        tregCredentials: { token: 'treg-token', organization: null },
        market: 'UK',
        fetchImplementation,
      }),
    );

    expect(requests).toHaveLength(24);
    expect(requests.every((request) => request.url.startsWith('https://treg.to/call/'))).toBe(true);
    expect(requests[0].body).toEqual({ prompt: QUERIES[0], country: 'GB' });
    expect(visibility?.queriesTested).toBe(8);
    expect(visibility?.notes).toEqual([]);
  });

  it('prefers treg over DataForSEO when both are set', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: { success: true, result: { text: 'Antwort', sources: [] } },
    }));

    await runAiVisibility(
      buildParams({ tregCredentials: { token: 'treg-token', organization: null }, fetchImplementation }),
    );

    expect(requests.some((request) => request.url.includes('dataforseo.com'))).toBe(false);
  });

  it('explains what is missing instead of failing when a key is not set', async () => {
    const withoutCredentials = await runAiVisibility(buildParams({ credentials: null }));
    const withoutModel = await runAiVisibility(buildParams({ anthropicClient: null }));

    for (const visibility of [withoutCredentials, withoutModel]) {
      expect(visibility?.rows).toEqual([]);
      expect(visibility?.presenceRate).toBeNull();
      expect(visibility?.notes).toEqual(['AI visibility needs treg or DataForSEO, and an Anthropic key. It was skipped.']);
    }
  });

  it('notes it when the model gives too few usable questions', async () => {
    const { client } = createFakeAnthropicClient(() =>
      buildTextMessage({ queries: ['Wie finde ich einen guten Anwalt?', 'Zu kurz?'] }),
    );
    const { fetchImplementation, requests } = createRecordingFetch(() => ({ json: buildDataForSeoEnvelope(null) }));

    const visibility = await runAiVisibility(buildParams({ anthropicClient: client, fetchImplementation }));

    expect(requests).toHaveLength(0);
    expect(visibility?.notes).toEqual(['Too few usable customer questions were generated. AI visibility was skipped.']);
  });

  it('does not use the company name in the questions', async () => {
    const { client } = createFakeAnthropicClient(() =>
      buildTextMessage({ queries: [...QUERIES.slice(0, 5), 'Was sagt kanzlei-beispiel.de zu Kündigungen?'] }),
    );
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(buildLlmResult()),
    }));

    const visibility = await runAiVisibility(buildParams({ anthropicClient: client, fetchImplementation }));

    expect(visibility?.rows.map((row) => row.query)).toEqual(QUERIES.slice(0, 5));
  });
});
