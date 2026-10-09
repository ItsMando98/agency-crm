import { describe, expect, it, vi } from 'vitest';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { buildLighthouseResult } from 'src/__mocks__/build-lighthouse-result.mock';
import { buildRankedKeywordsResult } from 'src/__mocks__/build-ranked-keywords-result.mock';
import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { checkDataForSeoCredentials } from 'src/dataforseo-client/check-dataforseo-credentials';
import { fetchBacklinkSummary } from 'src/dataforseo-client/fetch-backlink-summary';
import { fetchBacklinkTargets } from 'src/dataforseo-client/fetch-backlink-targets';
import { DATAFORSEO_LIGHTHOUSE_TIMEOUT_MS } from 'src/constants/dataforseo.const';
import { fetchCompetitors } from 'src/dataforseo-client/fetch-competitors';
import { fetchLighthouse } from 'src/dataforseo-client/fetch-lighthouse';
import { fetchRankedKeywords } from 'src/dataforseo-client/fetch-ranked-keywords';

const CREDENTIALS = { login: 'login', password: 'password' };

describe('DataForSEO fetchers', () => {
  it('requests ranked keywords for the market and parses them', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(
        buildRankedKeywordsResult([{ keyword: 'kündigungsfrist', position: 17, volume: 60000 }]),
        { cost: 0.07 },
      ),
    }));

    const { rankings, cost } = await fetchRankedKeywords({
      credentials: CREDENTIALS,
      target: 'example.com',
      market: 'CH',
      fetchImplementation,
    });

    expect(requests[0].url).toBe('https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live');
    expect(requests[0].body).toEqual([
      {
        target: 'example.com',
        location_code: 2756,
        language_code: 'de',
        limit: 500,
        order_by: ['keyword_data.keyword_info.search_volume,desc'],
      },
    ]);
    expect(rankings?.keywords[0].keyword).toBe('kündigungsfrist');
    expect(cost).toBe(0.07);
  });

  it('requests the backlink summary including subdomains', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope({ backlinks: 10, referring_domains: 3 }),
    }));

    const { summary } = await fetchBacklinkSummary({
      credentials: CREDENTIALS,
      target: 'example.com',
      fetchImplementation,
    });

    expect(requests[0].url).toBe('https://api.dataforseo.com/v3/backlinks/summary/live');
    expect(requests[0].body).toEqual([{ target: 'example.com', include_subdomains: true }]);
    expect(summary).toMatchObject({ backlinks: 10, referringDomains: 3 });
  });

  it('requests the most linked pages', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope({ items: [{ url: 'https://example.com/old', backlinks: 9 }] }),
    }));

    const { targets } = await fetchBacklinkTargets({
      credentials: CREDENTIALS,
      target: 'example.com',
      fetchImplementation,
    });

    expect(requests[0].url).toBe('https://api.dataforseo.com/v3/backlinks/domain_pages_summary/live');
    expect(requests[0].body).toEqual([{ target: 'example.com', limit: 40, order_by: ['backlinks,desc'] }]);
    expect(targets).toEqual([{ url: 'https://example.com/old', backlinks: 9, referringDomains: 0 }]);
  });

  it('requests competitors for the market', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope({ items: [{ domain: 'rival.de', intersections: 40 }] }),
    }));

    const { competitors } = await fetchCompetitors({
      credentials: CREDENTIALS,
      target: 'example.com',
      market: 'US',
      fetchImplementation,
    });

    expect(requests[0].url).toBe('https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live');
    expect(requests[0].body).toEqual([
      { target: 'example.com', location_code: 2840, language_code: 'en', limit: 15 },
    ]);
    expect(competitors).toEqual([{ domain: 'rival.de', commonKeywords: 40, estimatedTraffic: 0 }]);
  });

  it('requests a mobile Lighthouse run and waits longer than a normal request', async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(buildLighthouseResult({ performanceScore: 0.65 }), { cost: 0.005 }),
    }));

    const { lighthouse, cost } = await fetchLighthouse({
      credentials: CREDENTIALS,
      url: 'https://www.example.com',
      fetchImplementation,
    });

    expect(requests[0].url).toBe('https://api.dataforseo.com/v3/on_page/lighthouse/live/json');
    expect(requests[0].body).toEqual([
      { url: 'https://www.example.com', for_mobile: true, categories: ['performance'] },
    ]);
    expect(timeoutSpy).toHaveBeenCalledWith(DATAFORSEO_LIGHTHOUSE_TIMEOUT_MS);
    expect(lighthouse).toMatchObject({ performanceScore: 65, largestContentfulPaintMs: 1800 });
    expect(cost).toBe(0.005);
    timeoutSpy.mockRestore();
  });

  it('reads the balance when checking credentials', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope({ login: 'login', money: { balance: 12.5 } }),
    }));

    expect(await checkDataForSeoCredentials({ credentials: CREDENTIALS, fetchImplementation })).toEqual({
      balance: 12.5,
    });
    expect(requests[0]).toMatchObject({ url: 'https://api.dataforseo.com/v3/appendix/user_data', method: 'GET' });
  });

  it('returns a null balance when DataForSEO does not report one', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope({ login: 'login' }),
    }));

    expect((await checkDataForSeoCredentials({ credentials: CREDENTIALS, fetchImplementation })).balance).toBeNull();
  });
});
