import { describe, expect, it } from 'vitest';

import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { type MarketData } from 'src/types/market-data';
import { buildMarketReportSection } from 'src/utils/build-market-report-section.util';

const marketData: MarketData = {
  rankings: {
    totalKeywords: 6500,
    estimatedMonthlyTraffic: 54000,
    positionCounts: { position1: 122, positions2To3: 300, positions4To10: 900, positions11To20: 1200 },
    keywords: [],
  },
  backlinks: { backlinks: 900, referringDomains: 70, brokenBacklinks: 31, brokenPages: 6, rank: null },
  backlinkTargets: [],
  competitors: [{ domain: 'rival.de', commonKeywords: 340, estimatedTraffic: 500 }],
  costUsd: 0.3,
  notes: ['Backlink targets: Access denied.'],
};

describe('buildMarketReportSection', () => {
  it('renders totals, opportunities, discarded rankings, backlinks and competitors in German', () => {
    const text = buildMarketReportSection({
      marketData,
      language: 'DE',
      keywords: [
        buildScoredKeyword({ keyword: 'kündigungsfrist', position: 17, searchVolume: 60000 }),
        buildScoredKeyword({ keyword: 'hoarding wohnung', position: 6, searchVolume: 9900, category: 'QUICK_WIN' }),
        buildScoredKeyword({ keyword: 'spider solitaire', position: 4, searchVolume: 100000, category: 'NOT_RELEVANT', relevance: 0 }),
      ],
    }).join('\n');

    expect(text).toContain('## Sichtbarkeit und Markt');
    expect(text).toContain('Keywords mit Google-Ranking: 6500');
    expect(text).toContain('#1: 122 | #2-3: 300 | #4-10: 900 | #11-20: 1200');
    expect(text).toContain('### Keyword-Chancen: Platz 11 bis 30');
    expect(text).toContain('| kündigungsfrist | 17 | 60000 |');
    expect(text).toContain('### Keyword-Chancen: Platz 4 bis 10');
    expect(text).toContain('### Aussortierte Rankings');
    expect(text).toContain('- spider solitaire');
    expect(text).toContain('Verweisende Domains: 70');
    expect(text).toContain('| rival.de | 340 | 500 |');
    expect(text).toContain('> - Backlink targets: Access denied.');
  });

  it('renders an English section and skips empty parts', () => {
    const text = buildMarketReportSection({
      marketData: { ...marketData, backlinks: null, competitors: [], notes: [] },
      keywords: [],
      language: 'EN',
    }).join('\n');

    expect(text).toContain('## Visibility and market');
    expect(text).not.toContain('Backlinks');
    expect(text).not.toContain('Competitors');
    expect(text).not.toContain('Keyword opportunities');
  });

  it('escapes table separators in keywords', () => {
    const text = buildMarketReportSection({
      marketData,
      language: 'EN',
      keywords: [buildScoredKeyword({ keyword: 'a|b', position: 12 })],
    }).join('\n');

    expect(text).toContain('| a\\|b | 12 |');
  });
});
