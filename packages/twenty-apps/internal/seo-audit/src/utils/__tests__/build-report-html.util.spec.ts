import { describe, expect, it } from 'vitest';

import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { REPORT_PRINT_SCRIPT } from 'src/constants/report-print-script.const';
import { buildReportHtml } from 'src/utils/build-report-html.util';

const branding = { brandName: 'Muster Agentur', accentColor: '#7a3aa7', bookingUrl: null };

describe('buildReportHtml', () => {
  it('builds a standalone, print-ready German page', () => {
    const html = buildReportHtml(buildSeoAuditResult(), branding);

    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="de">');
    expect(html).toContain('<title>SEO-Audit www.kanzlei-beispiel.de</title>');
    expect(html).toContain('size:A4');
    expect(html).toContain('Muster Agentur');
    expect(html).toContain('Audit · www.kanzlei-beispiel.de · 06.10.2026');
    expect(html).toContain('id="print-report"');
    expect(html).toContain('Sichtbarkeit und Markt');
    expect(html).toContain('So haben wir geprüft');
  });

  it('numbers the sections in order and skips the ones without content', () => {
    const html = buildReportHtml(
      buildSeoAuditResult({ language: 'EN', marketData: null, keywords: [], tasks: [] }),
      branding,
    );
    const labels = [...html.matchAll(/class="eyebrow">(\d{2}) \//g)].map((match) => match[1]);

    expect(labels[0]).toBe('01');
    expect(labels).toEqual(labels.map((_, index) => String(index + 1).padStart(2, '0')));
    expect(html).not.toContain('id="market"');
    expect(html).not.toContain('id="roadmap"');
  });

  it('ends with the call to action only when a booking link is set', () => {
    const without = buildReportHtml(buildSeoAuditResult({ language: 'EN' }), branding);
    const withLink = buildReportHtml(buildSeoAuditResult({ language: 'EN' }), {
      ...branding,
      bookingUrl: 'https://cal.example.com/me',
    });

    expect(without).not.toContain('class="cta"');
    expect(withLink).toContain('class="cta"');
    expect(withLink).toContain('href="https://cal.example.com/me"');
  });

  it('builds an English page without brand and without market section', () => {
    const html = buildReportHtml(
      buildSeoAuditResult({ language: 'EN', marketData: null, keywords: [] }),
      { brandName: null, accentColor: '#2a78d6', bookingUrl: null },
    );

    expect(html).toContain('<html lang="en">');
    expect(html).not.toContain('Muster Agentur');
    expect(html).not.toContain('Visibility and market');
  });

  it('names no model, vendor or technical failure to the reader', () => {
    const base = buildSeoAuditResult({ language: 'DE' });
    const html = buildReportHtml(
      buildSeoAuditResult({
        language: 'DE',
        insights: {
          ...base.insights,
          summary: {
            model: 'claude-opus-5-5',
            headline: { text: 'Die Website holt zu wenig aus ihrem Angebot.', unverifiedNumbers: [] },
            strengths: [],
            blockers: [],
            thisWeek: [],
            thisMonth: [],
            thisQuarter: [],
            isFullyVerified: true,
          },
        },
        marketData: {
          rankings: null,
          backlinks: { backlinks: 10, referringDomains: 5, brokenBacklinks: 0, brokenPages: 0, rank: 1 },
          backlinkTargets: [],
          lighthouse: null,
          competitors: [],
          costUsd: 0,
          notes: ['Rankings: DataForSEO account paused.'],
        },
      }),
      branding,
    );

    expect(html).not.toMatch(/claude-|opus|anthropic|dataforseo|lighthouse|klassifikator|sprachmodell/i);
    expect(html).toContain('Die Website holt zu wenig aus ihrem Angebot.');
  });

  it('has no external resources, so it renders the same offline and in the PDF renderer', () => {
    const html = buildReportHtml(buildSeoAuditResult(), branding);

    expect(html).not.toMatch(/<link\b/);
    expect(html).not.toMatch(/<img\b/);
    expect(html).not.toMatch(/src="https?:/);
    expect(html).not.toMatch(/@import/);
  });

  it('is protected against markup coming from crawled websites', () => {
    const evil = '<script>alert(document.cookie)</script><img src=x onerror=alert(1)>';
    const html = buildReportHtml(
      buildSeoAuditResult({
        origin: 'https://evil.example.com',
        keywords: [buildScoredKeyword({ keyword: evil, url: evil })],
        assessments: [
          {
            url: evil,
            pageType: 'OTHER',
            searchIntent: 'NONE',
            helpfulness: 1,
            specificity: 1,
            trust: 1,
            confidence: 0.1,
            needsReview: true,
          },
        ],
        brokenBacklinkTargets: [{ url: evil, backlinks: 1, referringDomains: 1 }],
        marketData: {
          rankings: null,
          backlinks: null,
          backlinkTargets: [],
          lighthouse: null,
          competitors: [{ domain: evil, commonKeywords: 1, estimatedTraffic: 1 }],
          costUsd: 0,
          notes: [evil],
        },
      }),
      { brandName: evil, accentColor: '#7a3aa7', bookingUrl: null },
    );

    expect(html.match(/<script>/g)).toHaveLength(1);
    expect(html).toContain(`<script>${REPORT_PRINT_SCRIPT}</script>`);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;alert(document.cookie)&lt;/script&gt;');
    expect(html).toContain('Content-Security-Policy');
  });

  it('forbids network access and other scripts through its own policy', () => {
    const html = buildReportHtml(buildSeoAuditResult(), branding);

    expect(html).toMatch(/http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;;/);
    expect(html).toContain('<meta name="referrer" content="no-referrer">');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
  });
});
