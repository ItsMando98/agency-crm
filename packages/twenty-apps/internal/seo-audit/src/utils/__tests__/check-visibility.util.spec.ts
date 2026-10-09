import { describe, expect, it } from 'vitest';

import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { type MarketData } from 'src/types/market-data';
import { checkVisibility } from 'src/utils/check-visibility.util';

const buildMarketData = (totalKeywords = 10): MarketData => ({
  rankings: { totalKeywords, estimatedMonthlyTraffic: 0, positionCounts: null, keywords: [] },
  backlinks: null,
  backlinkTargets: [],
  lighthouse: null,
  competitors: [],
  costUsd: 0,
  notes: [],
});

describe('checkVisibility', () => {
  it('flags relevant keywords just before page one with examples', () => {
    const findings = checkVisibility({
      marketData: buildMarketData(),
      keywords: [
        buildScoredKeyword({ keyword: 'kündigungsfrist', position: 17, searchVolume: 60000 }),
        buildScoredKeyword({ keyword: 'kündigung', position: 19, searchVolume: 90000, url: 'https://example.com/b' }),
        buildScoredKeyword({ keyword: 'tiny', position: 12, searchVolume: 5 }),
      ],
      brokenBacklinkTargets: [],
      language: 'DE',
    });

    expect(findings).toEqual([
      {
        ruleId: 'KEYWORD_NEAR_PAGE_ONE',
        affectedUrls: ['https://example.com/b', 'https://example.com/kuendigung'],
        count: 2,
        details: [
          '"kündigung": Platz 19, 90000 Suchen pro Monat',
          '"kündigungsfrist": Platz 17, 60000 Suchen pro Monat',
        ],
      },
    ]);
  });

  it('flags quick wins on positions 4 to 10 with enough volume', () => {
    const findings = checkVisibility({
      marketData: buildMarketData(),
      keywords: [
        buildScoredKeyword({ keyword: 'hoarding apartment', position: 6, searchVolume: 9900, category: 'QUICK_WIN' }),
        buildScoredKeyword({ keyword: 'low volume', position: 5, searchVolume: 20, category: 'QUICK_WIN' }),
      ],
      brokenBacklinkTargets: [],
      language: 'EN',
    });

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: 'KEYWORD_QUICK_WINS',
      count: 1,
      details: ['"hoarding apartment": position 6, 9900 searches per month'],
    });
  });

  it('does not turn irrelevant or unsure keywords into opportunities', () => {
    expect(
      checkVisibility({
        marketData: buildMarketData(),
        keywords: [
          buildScoredKeyword({ category: 'NOT_RELEVANT', relevance: 0.01 }),
          buildScoredKeyword({ category: 'NEEDS_REVIEW', needsReview: true }),
        ],
        brokenBacklinkTargets: [],
        language: 'EN',
      }),
    ).toEqual([]);
  });

  it('reports backlinks that point to pages that no longer exist', () => {
    const findings = checkVisibility({
      marketData: null,
      keywords: [],
      brokenBacklinkTargets: [{ url: 'https://example.com/old', backlinks: 31, referringDomains: 12 }],
      language: 'DE',
    });

    expect(findings).toEqual([
      {
        ruleId: 'BACKLINKS_TO_BROKEN_PAGES',
        affectedUrls: ['https://example.com/old'],
        details: ['https://example.com/old: 31 Backlinks von 12 Domains'],
      },
    ]);
  });

  it('reports a site that ranks for nothing', () => {
    expect(
      checkVisibility({ marketData: buildMarketData(0), keywords: [], brokenBacklinkTargets: [], language: 'EN' }),
    ).toEqual([{ ruleId: 'NO_RANKINGS', affectedUrls: [] }]);
  });

  it('stays silent without market data', () => {
    expect(checkVisibility({ marketData: null, keywords: [], brokenBacklinkTargets: [], language: 'EN' })).toEqual([]);
  });
});
