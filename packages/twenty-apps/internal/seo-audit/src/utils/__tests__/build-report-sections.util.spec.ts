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

  it('builds the page rows from sure judgements only, weakest first', () => {
    const section = buildReportPagesSection(
      buildSeoAuditResult({
        language: 'DE',
        insights: insights(),
        assessments: [
          { url: 'https://x.de/gut', pageType: 'SERVICE', searchIntent: 'COMMERCIAL', helpfulness: 4, specificity: 4, trust: 4, confidence: 0.9, needsReview: false },
          { url: 'https://x.de/schwach', pageType: 'SERVICE', searchIntent: 'COMMERCIAL', helpfulness: 2, specificity: 2, trust: 3, confidence: 0.9, needsReview: false },
          { url: 'https://x.de/unsicher', pageType: 'OTHER', searchIntent: 'NONE', helpfulness: 1, specificity: 1, trust: 1, confidence: 0.3, needsReview: true },
        ],
      }),
    );

    expect(section?.body).toContain('class="h h2"');
    expect(section?.body).not.toContain('bitte prüfen');
    expect(section?.body).not.toContain('/unsicher');
    expect(section?.body.indexOf('/schwach')).toBeLessThan(section?.body.lastIndexOf('/gut') ?? 0);
    expect(section?.lead).not.toContain('Bewertungen');
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

  it('leaves summary sentences with unbacked numbers out of the report', () => {
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

    expect(section.body).toContain('Sicherheit liegt bei 98.');
    expect(section.body).not.toContain('777');
    expect(section.body).not.toContain('nicht belegt');
    expect(section.source).toBeUndefined();
    expect(JSON.stringify(section)).not.toContain('claude-opus');
    expect(markdown).toContain('(nicht belegt: 777)');
    expect(markdown).toContain('### Diese Woche');
    expect(markdown).not.toContain('### Diesen Monat');
  });

  it('builds the summary section without a written summary', () => {
    const section = buildReportSummarySection(buildSeoAuditResult({ language: 'DE' }));

    expect(section.body).not.toContain('class="digest"');
    expect(section.body).toContain('class="kpis"');
    expect(buildSummaryMarkdown(buildSeoAuditResult())).toEqual([]);
  });

  it('only shows the technical-only comparison when content pulls the score down', () => {
    const lower = buildReportSummarySection(
      buildSeoAuditResult({ language: 'DE', score: 74, insights: insights({ rulesOnlyScore: 91 }) }),
    );
    const higher = buildReportSummarySection(
      buildSeoAuditResult({ language: 'DE', score: 74, insights: insights({ rulesOnlyScore: 60 }) }),
    );

    expect(lower.body).toContain('Ein rein technischer Check käme auf 91 Punkte');
    expect(higher.body).not.toContain('technischer Check');
  });

  it('shows how much work each step holds without naming the tasks', () => {
    const section = buildReportRoadmapSection(buildSeoAuditResult({ language: 'EN' }));

    expect(section?.body.match(/class="phase"/g)).toHaveLength(3);
    expect(section?.body).toContain('7<small>days</small>');
    expect(section?.body).toMatch(/\d+ actions?/);
    expect(section?.body).not.toContain('internally linked pages');
  });

  it('leaves the effect line out of a step without actions', () => {
    const [task] = buildSeoAuditResult({ language: 'EN' }).tasks;
    const section = buildReportRoadmapSection(
      buildSeoAuditResult({ language: 'EN', tasks: [{ ...task, priority: 'LOW', effort: 'HIGH' }] }),
    );

    expect(section?.body).toContain('Nothing urgent is due here.');
    expect(section?.body.match(/class="res"/g)).toHaveLength(1);
  });

  it('shows the verified summary sentences of each step', () => {
    const section = buildReportRoadmapSection(
      buildSeoAuditResult({
        language: 'DE',
        insights: insights({
          summary: {
            model: 'x',
            headline: item('x'),
            strengths: [],
            blockers: [],
            thisWeek: [item('Die Startseite sagt klar, was ihr tut.')],
            thisMonth: [item('Es gibt 999 offene Punkte.', ['999'])],
            thisQuarter: [],
            isFullyVerified: false,
          },
        }),
      }),
    );

    expect(section?.body).toContain('Die Startseite sagt klar, was ihr tut.');
    expect(section?.body).not.toContain('999');
  });

  it('leaves the roadmap out without tasks', () => {
    expect(buildReportRoadmapSection(buildSeoAuditResult({ tasks: [] }))).toBeNull();
  });

  it('names no model, tool or provider in the method section', () => {
    const { body } = buildReportMethodSection(buildSeoAuditResult({ language: 'EN' }));

    expect(body).toContain('Crawl');
    expect(body).not.toMatch(/claude|opus|anthropic|dataforseo|lighthouse|classifier|model/i);
    expect(body).not.toContain('https://kanzlei-beispiel.de/unsicher');
  });

  it('adds the summary card only when a summary exists', () => {
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

    expect(body).toContain('Every number in the summary was checked');
    expect(buildReportMethodSection(buildSeoAuditResult({ language: 'EN' })).body).not.toContain(
      'Every number in the summary',
    );
  });
});
