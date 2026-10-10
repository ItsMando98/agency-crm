import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { type AuditInsights } from 'src/types/audit-insights';
import { buildInsightsMarkdown, buildSummaryMarkdown } from 'src/utils/build-insights-markdown.util';
import { buildReportMethodSection } from 'src/utils/build-report-method-html.util';
import { buildReportOpportunitiesSection } from 'src/utils/build-report-opportunities-html.util';
import { buildReportPagesSection } from 'src/utils/build-report-pages-html.util';
import { buildReportRoadmapSection } from 'src/utils/build-report-roadmap-html.util';
import { buildReportStrengthsSection } from 'src/utils/build-report-strengths-html.util';
import { buildReportSummarySection } from 'src/utils/build-report-summary-html.util';

const insights = (overrides: Partial<AuditInsights> = {}): AuditInsights => ({
  rulesOnlyScore: 91,
  confidence: { total: 2, definitive: 1, sharePercent: 50 },
  strengths: [{ kind: 'STRONG_AREAS', areas: [{ area: 'SECURITY', score: 98 }] }],
  competingPages: [],
  missingLocations: [],
  summary: null,
  ...overrides,
});

const item = (text: string, unverifiedNumbers: string[] = []) => ({ text, unverifiedNumbers });

describe('report sections', () => {
  it('shows the strengths and leaves the section out without any', () => {
    const result = buildSeoAuditResult({ language: 'DE', insights: insights() });

    expect(buildReportStrengthsSection(result)?.body).toContain('Stark aufgestellt:');
    expect(buildReportStrengthsSection(result)?.body).toContain('Starke Bereiche');
    expect(
      buildReportStrengthsSection(buildSeoAuditResult({ insights: insights({ strengths: [] }) })),
    ).toBeNull();
  });

  it('shows the score comparison in the summary and leaves it out when both scores are equal', () => {
    const different = buildReportSummarySection(
      buildSeoAuditResult({ language: 'DE', score: 74, insights: insights() }),
    );
    const equal = buildReportSummarySection(
      buildSeoAuditResult({ language: 'DE', score: 91, insights: insights() }),
    );

    expect(different.body).toContain('91 → 74');
    expect(equal.body).not.toContain('→');
    expect(buildInsightsMarkdown(buildSeoAuditResult({ language: 'DE', score: 74, insights: insights() })).join('\n')).toContain(
      'Allein nach den gemessenen Regeln läge der Score bei 91',
    );
  });

  it('builds the page rows with the weakest page first and flags unsure ratings', () => {
    const section = buildReportPagesSection(buildSeoAuditResult({ language: 'DE', insights: insights() }));

    expect(section?.body).toContain('class="h h2"');
    expect(section?.body).toContain('bitte prüfen');
    expect(section?.body.indexOf('/unsicher')).toBeLessThan(section?.body.lastIndexOf('/kuendigung') ?? 0);
    expect(section?.lead).toContain('1 von 2 Bewertungen (50 %) waren eindeutig');
  });

  it('leaves the pages out without assessments', () => {
    expect(buildReportPagesSection(buildSeoAuditResult({ assessments: [] }))).toBeNull();
  });

  it('escapes page urls that come from the crawled website', () => {
    const section = buildReportPagesSection(
      buildSeoAuditResult({
        assessments: [
          { url: 'https://x.de/<script>alert(1)</script>', pageType: 'OTHER', searchIntent: 'NONE', helpfulness: 1, specificity: 1, trust: 1, confidence: 0.9, needsReview: false },
        ],
      }),
    );

    expect(section?.body).not.toContain('<script>');
  });

  it('lists competing pages and places without a page', () => {
    const section = buildReportOpportunitiesSection(
      buildSeoAuditResult({
        language: 'DE',
        insights: insights({
          competingPages: [{ topic: 'Kündigungsfrist', urls: ['https://x.de/a', 'https://x.de/b'] }],
          missingLocations: [{ place: 'Neuss', searchVolume: 1900, keywords: ['entrümpelung neuss'] }],
        }),
      }),
    );

    expect(section?.body).toContain('Kündigungsfrist');
    expect(section?.body).toContain('https://x.de/b');
    expect(section?.body).toContain('Neuss');
    expect(section?.body).toContain('1.900');
  });

  it('leaves the opportunities out when there are none', () => {
    expect(buildReportOpportunitiesSection(buildSeoAuditResult({ insights: insights() }))).toBeNull();
  });

  it('marks numbers in the summary that the audit does not back up', () => {
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

    const section = buildReportSummarySection(result);
    const markdown = buildSummaryMarkdown(result).join('\n');

    expect(section.lead).toBe('Technisch stark, inhaltlich schwach.');
    expect(section.body).toContain('nicht belegt: 777');
    expect(section.source).toContain('Zahlen, die der Audit nicht belegt, sind markiert');
    expect(markdown).toContain('(nicht belegt: 777)');
    expect(markdown).toContain('### Diese Woche');
    expect(markdown).not.toContain('### Diesen Monat');
  });

  it('falls back to the strongest and weakest area without a written summary', () => {
    const section = buildReportSummarySection(buildSeoAuditResult({ language: 'DE' }));

    expect(section.lead).toContain('Am stärksten ist der Bereich');
    expect(section.source).toBeUndefined();
    expect(buildSummaryMarkdown(buildSeoAuditResult())).toEqual([]);
  });

  it('puts every task into the phase of its horizon', () => {
    const section = buildReportRoadmapSection(buildSeoAuditResult({ language: 'EN' }));

    expect(section?.body.match(/class="phase"/g)).toHaveLength(3);
    expect(section?.body).toContain('7<small>days</small>');
    expect(section?.body).toContain('1 internally linked pages no longer exist (4xx)');
  });

  it('leaves the roadmap out without tasks', () => {
    expect(buildReportRoadmapSection(buildSeoAuditResult({ tasks: [] }))).toBeNull();
  });

  it('lists the uncertain judgements in the method section', () => {
    const { body } = buildReportMethodSection(buildSeoAuditResult({ language: 'EN' }));

    expect(body).toContain('Crawl');
    expect(body).toContain('https://kanzlei-beispiel.de/unsicher');
    expect(body).toContain('unklarer begriff');
    expect(body).toContain('fixed text blocks');
  });

  it('names the summary model when a summary exists', () => {
    const { body } = buildReportMethodSection(
      buildSeoAuditResult({
        language: 'EN',
        insights: insights({
          summary: {
            model: 'claude-opus-5-5',
            headline: item('x'),
            strengths: [],
            blockers: [],
            thisWeek: [],
            thisMonth: [],
            thisQuarter: [],
            isFullyVerified: true,
          },
        }),
      }),
    );

    expect(body).toContain('claude-opus-5-5 writes it');
    expect(body).toContain('Every number is backed up.');
  });
});
