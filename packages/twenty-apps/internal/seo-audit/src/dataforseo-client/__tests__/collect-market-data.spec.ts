import { describe, expect, it } from 'vitest';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { buildLighthouseResult } from 'src/__mocks__/build-lighthouse-result.mock';
import { buildRankedKeywordsResult } from 'src/__mocks__/build-ranked-keywords-result.mock';
import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { collectMarketData } from 'src/dataforseo-client/collect-market-data';

const PARAMS = {
  credentials: { login: 'login', password: 'password' },
  origin: 'https://www.example.com',
  market: 'DE' as const,
};

describe('collectMarketData', () => {
  it('combines all five requests and sums their cost', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(({ url }) => {
      if (url.includes('lighthouse')) {
        return { json: buildDataForSeoEnvelope(buildLighthouseResult({ performanceScore: 0.65 }), { cost: 0.005 }) };
      }

      if (url.includes('ranked_keywords')) {
        return { json: buildDataForSeoEnvelope(buildRankedKeywordsResult([{ keyword: 'a', position: 2, volume: 10 }]), { cost: 0.07 }) };
      }

      if (url.includes('domain_pages_summary')) {
        return { json: buildDataForSeoEnvelope({ items: [{ url: 'https://example.com/old', backlinks: 4 }] }, { cost: 0.03 }) };
      }

      if (url.includes('backlinks/summary')) {
        return { json: buildDataForSeoEnvelope({ backlinks: 10, referring_domains: 3 }, { cost: 0.02 }) };
      }

      return { json: buildDataForSeoEnvelope({ items: [{ domain: 'rival.de', intersections: 5 }] }, { cost: 0.04 }) };
    });

    const marketData = await collectMarketData({ ...PARAMS, fetchImplementation });

    expect(requests).toHaveLength(5);
    const marketRequests = requests.filter((request) => !request.url.includes('lighthouse'));

    expect(marketRequests.every((request) => (request.body as { target: string }[])[0].target === 'example.com')).toBe(true);
    expect(requests.find((request) => request.url.includes('lighthouse'))?.body).toEqual([
      { url: 'https://www.example.com', for_mobile: true, categories: ['performance'] },
    ]);
    expect(marketData.lighthouse?.performanceScore).toBe(65);
    expect(marketData.rankings?.totalKeywords).toBe(1);
    expect(marketData.backlinks?.backlinks).toBe(10);
    expect(marketData.backlinkTargets).toHaveLength(1);
    expect(marketData.competitors).toHaveLength(1);
    expect(marketData.costUsd).toBeCloseTo(0.165);
    expect(marketData.notes).toEqual([]);
  });

  it('keeps the market data when Lighthouse fails', async () => {
    const { fetchImplementation } = createRecordingFetch(({ url }) =>
      url.includes('lighthouse')
        ? { json: buildDataForSeoEnvelope(null, { taskStatusCode: 50000, statusMessage: 'Lighthouse run failed.' }) }
        : { json: buildDataForSeoEnvelope(url.includes('ranked_keywords') ? buildRankedKeywordsResult([{ keyword: 'a', position: 2, volume: 10 }]) : { items: [] }) },
    );

    const marketData = await collectMarketData({ ...PARAMS, fetchImplementation });

    expect(marketData.rankings).not.toBeNull();
    expect(marketData.lighthouse).toBeNull();
    expect(marketData.notes).toEqual(['Lighthouse: Lighthouse run failed.']);
  });

  it('keeps the rankings when the backlinks subscription is missing', async () => {
    const { fetchImplementation } = createRecordingFetch(({ url }) =>
      url.includes('/backlinks/')
        ? { json: buildDataForSeoEnvelope(null, { taskStatusCode: 40204, statusMessage: 'Access denied.' }) }
        : { json: buildDataForSeoEnvelope(url.includes('ranked_keywords') ? buildRankedKeywordsResult([{ keyword: 'a', position: 2, volume: 10 }]) : { items: [] }) },
    );

    const marketData = await collectMarketData({ ...PARAMS, fetchImplementation });

    expect(marketData.rankings).not.toBeNull();
    expect(marketData.backlinks).toBeNull();
    expect(marketData.backlinkTargets).toEqual([]);
    expect(marketData.notes).toEqual([
      'Backlinks: Access denied.',
      'Backlink targets: Access denied.',
    ]);
  });

  it('reports every failure when the credentials are rejected', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      status: 401,
      json: { status_code: 40100, status_message: 'Authentication failed' },
    }));

    const marketData = await collectMarketData({ ...PARAMS, fetchImplementation });

    expect(marketData.rankings).toBeNull();
    expect(marketData.notes).toHaveLength(5);
    expect(marketData.notes[0]).toBe('Rankings: Authentication failed');
    expect(marketData.costUsd).toBe(0);
  });
});
