import { describe, expect, it } from 'vitest';

import { buildAiVisibility } from 'src/__mocks__/build-ai-visibility.mock';
import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportHeroHtml } from 'src/utils/build-report-hero-html.util';

const branding = { brandName: 'Muster Agentur', accentColor: '#7a3aa7', bookingUrl: null };

describe('buildReportHeroHtml', () => {
  it('shows domain, score, grade and the print button', () => {
    const html = buildReportHeroHtml(buildSeoAuditResult({ score: 84, grade: 'B' }), branding);

    expect(html).toContain('www.kanzlei-beispiel.de');
    expect(html).toContain('<span>84</span>');
    expect(html).toContain('--s:84');
    expect(html).toContain('Note B');
    expect(html).toContain('id="print-report"');
    expect(html).toContain('Muster Agentur');
    expect(html).toContain('Am stärksten ist der Bereich');
  });

  it('colors the gauge by score band', () => {
    expect(buildReportHeroHtml(buildSeoAuditResult({ score: 40 }), branding)).toContain('gauge-card c-crit');
    expect(buildReportHeroHtml(buildSeoAuditResult({ score: 65 }), branding)).toContain('gauge-card c-mid');
    expect(buildReportHeroHtml(buildSeoAuditResult({ score: 90 }), branding)).toContain('gauge-card c-good');
  });

  it('shows the AI engines only when the visibility check ran', () => {
    const without = buildReportHeroHtml(buildSeoAuditResult({ language: 'EN' }), branding);
    const withCheck = buildReportHeroHtml(
      buildSeoAuditResult({ language: 'EN', aiVisibility: buildAiVisibility() }),
      branding,
    );

    expect(without).not.toContain('AI engines');
    expect(withCheck).toContain('AI engines');
    expect(withCheck).toContain('ChatGPT');
  });

  it('adds the booking button to the header only when a link is set', () => {
    const withLink = buildReportHeroHtml(buildSeoAuditResult(), {
      ...branding,
      bookingUrl: 'https://cal.example.com/me',
    });

    expect(withLink).toContain('href="https://cal.example.com/me"');
    expect(buildReportHeroHtml(buildSeoAuditResult(), branding)).not.toContain('href=');
  });

  it('escapes the brand name', () => {
    const html = buildReportHeroHtml(buildSeoAuditResult(), { ...branding, brandName: '<b>x</b>' });

    expect(html).not.toContain('<b>x</b>');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });
});
