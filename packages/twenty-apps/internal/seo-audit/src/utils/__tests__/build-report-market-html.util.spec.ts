import { describe, expect, it } from 'vitest';

import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportMarketHtml } from 'src/utils/build-report-market-html.util';

describe('buildReportMarketHtml', () => {
  it('renders positions, opportunities, discarded rankings, backlinks and competitors', () => {
    const html = buildReportMarketHtml(buildSeoAuditResult({ language: 'EN' }));

    expect(html).toContain('Visibility and market');
    expect(html).toContain('Position distribution');
    expect(html).toContain('>1,200<');
    expect(html).toContain('Keyword opportunities: Positions 4 to 10');
    expect(html).toContain('Keyword opportunities: Positions 11 to 30');
    expect(html).toContain('abfindung berechnen');
    expect(html).toContain('Filtered out rankings');
    expect(html).toContain('wm 2026 spielplan');
    expect(html).toContain('Backlinks pointing to pages that no longer exist');
    expect(html).toContain('anwalt-konkurrent.de');
  });

  it('renders nothing without market data', () => {
    expect(buildReportMarketHtml(buildSeoAuditResult({ marketData: null }))).toBe('');
  });

  it('keeps each opportunity table together with its heading', () => {
    const html = buildReportMarketHtml(buildSeoAuditResult({ language: 'EN' }));

    expect(html.match(/<div class="keep-together"><h3>Keyword opportunities/g)).toHaveLength(2);
  });

  it('shows notes about unavailable data and escapes keywords', () => {
    const html = buildReportMarketHtml(
      buildSeoAuditResult({
        language: 'EN',
        keywords: [buildScoredKeyword({ keyword: '<b>x</b>', category: 'QUICK_WIN', position: 5 })],
        marketData: {
          rankings: null,
          backlinks: null,
          backlinkTargets: [],
          competitors: [],
          costUsd: 0,
          notes: ['Backlinks: Access denied.'],
        },
        brokenBacklinkTargets: [],
      }),
    );

    expect(html).toContain('Backlinks: Access denied.');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).not.toContain('Position distribution');
  });
});
