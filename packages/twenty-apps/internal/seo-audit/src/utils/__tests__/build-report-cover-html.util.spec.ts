import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportCoverHtml } from 'src/utils/build-report-cover-html.util';

const branding = { brandName: 'Muster Agentur', accentColor: '#7a3aa7' };

describe('buildReportCoverHtml', () => {
  it('shows domain, date, hero score, grade and the brand', () => {
    const html = buildReportCoverHtml(buildSeoAuditResult(), branding);

    expect(html).toContain('kanzlei-beispiel.de');
    expect(html).toContain('06.10.2026');
    expect(html).toContain('<span class="hero-score">84</span>');
    expect(html).toContain('Note B');
    expect(html).toContain('Erstellt von Muster Agentur');
    expect(html).toContain('Am stärksten ist der Bereich Sicherheit (98), am schwächsten Inhaltsqualität (59).');
  });

  it('adds market tiles only when market data exists', () => {
    const withMarket = buildReportCoverHtml(buildSeoAuditResult(), branding);
    const withoutMarket = buildReportCoverHtml(buildSeoAuditResult({ marketData: null }), branding);

    expect(withMarket).toContain('261.000');
    expect(withMarket).toContain('Keywords im Ranking');
    expect(withoutMarket).not.toContain('Keywords im Ranking');
    expect(withoutMarket).toContain('--tile-columns: 3');
  });

  it('omits the brand line and warns when content quality was not assessed', () => {
    const html = buildReportCoverHtml(
      buildSeoAuditResult({ language: 'EN', assessments: [] }),
      { brandName: null, accentColor: '#2a78d6' },
    );

    expect(html).not.toContain('Prepared by');
    expect(html).toContain('Content quality was not assessed');
  });

  it('escapes the hostname and brand name', () => {
    const html = buildReportCoverHtml(buildSeoAuditResult(), {
      brandName: '<img src=x onerror=alert(1)>',
      accentColor: '#7a3aa7',
    });

    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
