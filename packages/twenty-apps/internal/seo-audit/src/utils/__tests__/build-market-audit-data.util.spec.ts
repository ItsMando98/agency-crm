import { describe, expect, it } from 'vitest';

import { buildMarketAuditData } from 'src/utils/build-market-audit-data.util';

describe('buildMarketAuditData', () => {
  it('writes nothing without market data', () => {
    expect(buildMarketAuditData(null)).toEqual({});
  });

  it('maps the market metrics onto audit fields', () => {
    expect(
      buildMarketAuditData({
        rankings: { totalKeywords: 6500, estimatedMonthlyTraffic: 54000.4, positionCounts: null, keywords: [] },
        backlinks: { backlinks: 900, referringDomains: 70, brokenBacklinks: null, brokenPages: null, rank: null },
        backlinkTargets: [],
        lighthouse: null,
        competitors: [{ domain: 'rival.de', commonKeywords: 5, estimatedTraffic: 1 }],
        costUsd: 0.34,
        notes: ['Backlinks: Access denied.'],
      }),
    ).toEqual({
      organicKeywordCount: 6500,
      estimatedMonthlyTraffic: 54000,
      backlinkCount: 900,
      referringDomainCount: 70,
      mobilePerformanceScore: null,
      mobileLcpMs: null,
      mobileCls: null,
      mobileTbtMs: null,
      competitors: [{ domain: 'rival.de', commonKeywords: 5, estimatedTraffic: 1 }],
      marketDataCostUsd: 0.34,
      marketDataNotes: 'Backlinks: Access denied.',
    });
  });

  it('maps the Lighthouse measurement onto the mobile fields', () => {
    expect(
      buildMarketAuditData({
        rankings: null,
        backlinks: null,
        backlinkTargets: [],
        lighthouse: {
          url: 'https://example.com/',
          performanceScore: 65,
          largestContentfulPaintMs: 7138,
          cumulativeLayoutShift: 0.123,
          totalBlockingTimeMs: 182,
          fetchedAt: '2026-10-08T20:58:44.689Z',
        },
        competitors: [],
        costUsd: 0.005,
        notes: [],
      }),
    ).toMatchObject({
      mobilePerformanceScore: 65,
      mobileLcpMs: 7138,
      mobileCls: 0.123,
      mobileTbtMs: 182,
    });
  });

  it('keeps missing parts empty', () => {
    expect(
      buildMarketAuditData({ rankings: null, backlinks: null, backlinkTargets: [], lighthouse: null, competitors: [], costUsd: 0, notes: [] }),
    ).toMatchObject({ organicKeywordCount: null, estimatedMonthlyTraffic: null, backlinkCount: null, marketDataNotes: null });
  });
});
