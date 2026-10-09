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

  it('renders the Lighthouse measurement as tiles', () => {
    const html = buildReportMarketHtml(
      buildSeoAuditResult({
        language: 'EN',
        marketData: {
          rankings: null,
          backlinks: null,
          backlinkTargets: [],
          lighthouse: {
            url: 'https://www.kanzlei-beispiel.de/',
            performanceScore: 65,
            largestContentfulPaintMs: 7138,
            cumulativeLayoutShift: 0.123,
            totalBlockingTimeMs: 182,
            fetchedAt: null,
          },
          competitors: [],
          costUsd: 0.005,
          notes: [],
        },
      }),
    );

    expect(html).toContain('Mobile loading speed');
    expect(html).toContain('>65<');
    expect(html).toContain('>7.1 s<');
    expect(html).toContain('>0.12<');
    expect(html).toContain('>182 ms<');
  });

  it('leaves out the loading speed block without a Lighthouse measurement', () => {
    expect(buildReportMarketHtml(buildSeoAuditResult({ language: 'EN' }))).not.toContain(
      'Mobile loading speed',
    );
  });

  it('shows only the Lighthouse metrics that were measured', () => {
    const html = buildReportMarketHtml(
      buildSeoAuditResult({
        language: 'DE',
        marketData: {
          rankings: null,
          backlinks: null,
          backlinkTargets: [],
          lighthouse: {
            url: 'https://www.kanzlei-beispiel.de/',
            performanceScore: null,
            largestContentfulPaintMs: 3200,
            cumulativeLayoutShift: null,
            totalBlockingTimeMs: null,
            fetchedAt: null,
          },
          competitors: [],
          costUsd: 0,
          notes: [],
        },
      }),
    );

    expect(html).toContain('>3,2 s<');
    expect(html).not.toContain('Layoutverschiebung');
    expect(html).not.toContain('Performance-Score');
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
          lighthouse: null,
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
