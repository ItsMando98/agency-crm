import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { type AuditInsights } from 'src/types/audit-insights';
import { buildOpportunitiesHtml, buildPagesHtml, buildStrengthsHtml, buildSummaryHtml } from 'src/utils/build-insights-html.util';
import { buildInsightsMarkdown, buildSummaryMarkdown } from 'src/utils/build-insights-markdown.util';

const insights = (overrides: Partial<AuditInsights> = {}): AuditInsights => ({
  rulesOnlyScore: 91,
  confidence: { total: 2, definitive: 1, sharePercent: 50 },
  strengths: [{ kind: 'STRONG_AREAS', areas: [{ area: 'SECURITY', score: 98 }] }],
  competingPages: [],
  missingLocations: [],
  summary: null,
  ...overrides,
});

describe('insight sections', () => {
  it('shows the score comparison and the strengths', () => {
    const result = buildSeoAuditResult({ language: 'DE', score: 74, insights: insights() });

    const html = buildStrengthsHtml(result);
    const markdown = buildInsightsMarkdown(result).join('\n');

    expect(html).toContain('Was schon funktioniert');
    expect(html).toContain('>91<');
    expect(html).toContain('>74<');
    expect(markdown).toContain('Allein nach den gemessenen Regeln läge der Score bei 91');
    expect(markdown).toContain('Stark aufgestellt:');
  });

  it('leaves the comparison out when both scores are equal', () => {
    const result = buildSeoAuditResult({ language: 'DE', score: 91, insights: insights() });

    expect(buildStrengthsHtml(result)).not.toContain('Was die Inhaltsbewertung ausmacht');
  });

  it('builds the heatmap with the weakest page first and flags unsure ratings', () => {
    const result = buildSeoAuditResult({ language: 'DE', insights: insights() });

    const html = buildPagesHtml(result);

    expect(html).toContain('Seiten im Detail');
    expect(html).toContain('heat heat-2');
    expect(html).toContain('bitte prüfen');
    expect(html.indexOf('/unsicher')).toBeLessThan(html.indexOf('/kuendigung'));
    expect(html).toContain('1 von 2 Bewertungen (50 %) waren eindeutig');
  });

  it('escapes page urls that come from the crawled website', () => {
    const result = buildSeoAuditResult({
      assessments: [
        { url: 'https://x.de/<script>alert(1)</script>', pageType: 'OTHER', searchIntent: 'NONE', helpfulness: 1, specificity: 1, trust: 1, confidence: 0.9, needsReview: false },
      ],
    });

    expect(buildPagesHtml(result)).not.toContain('<script>');
  });

  it('lists competing pages and places without a page', () => {
    const result = buildSeoAuditResult({
      language: 'DE',
      insights: insights({
        competingPages: [{ topic: 'Kündigungsfrist', urls: ['https://x.de/a', 'https://x.de/b'] }],
        missingLocations: [{ place: 'Neuss', searchVolume: 1900, keywords: ['entrümpelung neuss'] }],
      }),
    });

    const html = buildOpportunitiesHtml(result);

    expect(html).toContain('Kündigungsfrist');
    expect(html).toContain('https://x.de/b');
    expect(html).toContain('Neuss');
    expect(html).toContain('1.900');
  });

  it('marks numbers in the summary that the audit does not back up', () => {
    const item = (text: string, unverifiedNumbers: string[] = []) => ({ text, unverifiedNumbers });
    const result = buildSeoAuditResult({
      language: 'DE',
      insights: insights({
        summary: {
          model: 'claude-opus-5-5',
          headline: item('Technisch stark, inhaltlich schwach.'),
          strengths: [item('Sicherheit liegt bei 98.')],
          blockers: [item('Es gibt 777 tote Links.', ['777'])],
          thisWeek: [item('Titel korrigieren.')],
          thisMonth: [],
          thisQuarter: [],
          isFullyVerified: false,
        },
      }),
    });

    const html = buildSummaryHtml(result);
    const markdown = buildSummaryMarkdown(result).join('\n');

    expect(html).toContain('nicht belegt: 777');
    expect(html).toContain('Zahlen, die der Audit nicht belegt, sind markiert');
    expect(markdown).toContain('(nicht belegt: 777)');
    expect(markdown).toContain('### Diese Woche');
    expect(markdown).not.toContain('### Diesen Monat');
  });

  it('adds nothing without a summary', () => {
    expect(buildSummaryHtml(buildSeoAuditResult())).toBe('');
    expect(buildSummaryMarkdown(buildSeoAuditResult())).toEqual([]);
  });
});
