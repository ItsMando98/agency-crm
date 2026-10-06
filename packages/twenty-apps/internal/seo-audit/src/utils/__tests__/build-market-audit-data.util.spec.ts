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
        competitors: [{ domain: 'rival.de', commonKeywords: 5, estimatedTraffic: 1 }],
        costUsd: 0.34,
        notes: ['Backlinks: Access denied.'],
      }),
    ).toEqual({
      organicKeywordCount: 6500,
      estimatedMonthlyTraffic: 54000,
      backlinkCount: 900,
      referringDomainCount: 70,
      competitors: [{ domain: 'rival.de', commonKeywords: 5, estimatedTraffic: 1 }],
      marketDataCostUsd: 0.34,
      marketDataNotes: 'Backlinks: Access denied.',
    });
  });

  it('keeps missing parts empty', () => {
    expect(
      buildMarketAuditData({ rankings: null, backlinks: null, backlinkTargets: [], competitors: [], costUsd: 0, notes: [] }),
    ).toMatchObject({ organicKeywordCount: null, estimatedMonthlyTraffic: null, backlinkCount: null, marketDataNotes: null });
  });
});
