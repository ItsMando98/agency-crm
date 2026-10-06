import { describe, expect, it } from 'vitest';

import { buildRankedKeywordsResult } from 'src/__mocks__/build-ranked-keywords-result.mock';
import { parseRankedKeywords } from 'src/utils/parse-ranked-keywords.util';

describe('parseRankedKeywords', () => {
  it('maps keywords, positions, volumes and the summary metrics', () => {
    const summary = parseRankedKeywords(
      buildRankedKeywordsResult([
        { keyword: 'kündigungsfrist', position: 17, volume: 60000, url: 'https://example.com/a', etv: 12.5 },
        { keyword: 'anwalt düsseldorf', position: 1, volume: 900, etv: 400 },
      ]),
    );

    expect(summary).toEqual({
      totalKeywords: 2,
      estimatedMonthlyTraffic: 412.5,
      positionCounts: { position1: 1, positions2To3: 0, positions4To10: 0, positions11To20: 1 },
      keywords: [
        { keyword: 'kündigungsfrist', position: 17, searchVolume: 60000, estimatedTraffic: 12.5, url: 'https://example.com/a' },
        { keyword: 'anwalt düsseldorf', position: 1, searchVolume: 900, estimatedTraffic: 400, url: 'https://example.com/' },
      ],
    });
  });

  it('skips items without a position and non-organic results', () => {
    const result = buildRankedKeywordsResult([
      { keyword: 'organic', position: 3, volume: 10 },
      { keyword: 'paid ad', position: 1, volume: 10, type: 'paid' },
    ]);

    result.items.push({ keyword_data: { keyword: 'no position', keyword_info: { search_volume: 5 } } } as never);

    expect(parseRankedKeywords(result)?.keywords.map((keyword) => keyword.keyword)).toEqual(['organic']);
  });

  it('falls back to counting the fetched items when metrics are missing', () => {
    const summary = parseRankedKeywords({
      items: [
        {
          keyword_data: { keyword: 'a', keyword_info: { search_volume: 1 } },
          ranked_serp_element: { serp_item: { rank_absolute: 4, etv: 2 } },
        },
      ],
    });

    expect(summary).toMatchObject({ totalKeywords: 1, estimatedMonthlyTraffic: 2, positionCounts: null });
  });

  it('treats a missing search volume as zero', () => {
    const summary = parseRankedKeywords({
      items: [
        {
          keyword_data: { keyword: 'a' },
          ranked_serp_element: { serp_item: { rank_group: 2 } },
        },
      ],
    });

    expect(summary?.keywords[0].searchVolume).toBe(0);
  });

  it.each([null, undefined, 'x', 5])('returns null for %j', (result) => {
    expect(parseRankedKeywords(result)).toBeNull();
  });
});
