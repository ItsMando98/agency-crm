import { describe, expect, it } from 'vitest';

import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportMarketSection } from 'src/utils/build-report-market-html.util';

const buildReportMarketBody = (result: Parameters<typeof buildReportMarketSection>[0]): string =>
  buildReportMarketSection(result)?.body ?? '';

describe('buildReportMarketSection', () => {
  it('renders positions, opportunities, discarded rankings, backlinks and competitors', () => {
    const html = buildReportMarketBody(buildSeoAuditResult({ language: 'EN' }));

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

  it('renders the Lighthouse measurement as key figures', () => {
    const html = buildReportMarketBody(
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
    expect(buildReportMarketBody(buildSeoAuditResult({ language: 'EN' }))).not.toContain(
      'Mobile loading speed',
    );
  });

  it('shows only the Lighthouse metrics that were measured', () => {
    const html = buildReportMarketBody(
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

  it('leaves the section out without market data', () => {
    expect(buildReportMarketSection(buildSeoAuditResult({ marketData: null }))).toBeNull();
  });

  it('shows notes about unavailable data and escapes keywords', () => {
    const html = buildReportMarketBody(
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
