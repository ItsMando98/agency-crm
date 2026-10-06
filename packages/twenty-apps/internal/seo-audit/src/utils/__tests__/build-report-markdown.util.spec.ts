import { describe, expect, it } from 'vitest';

import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';
import { buildReportMarkdown } from 'src/utils/build-report-markdown.util';

const baseParams = {
  origin: 'https://example.com',
  generatedAt: new Date('2026-10-06T10:00:00Z'),
  score: 81,
  grade: 'B',
  areaScores: { CRAWLABILITY: 95, CONTENT_QUALITY: 59, SECURITY: 98 },
  pageCount: 56,
  assessments: [],
  contentQualityAssessed: true,
};

describe('buildReportMarkdown', () => {
  it('renders a German report with scores, areas and prioritized tasks', () => {
    const tasks = buildAuditTasks(
      [
        { ruleId: 'NOT_HTTPS', affectedUrls: [] },
        { ruleId: 'TITLE_MISSING', affectedUrls: ['https://example.com/a'] },
        { ruleId: 'LOW_HELPFULNESS', affectedUrls: ['https://example.com/b'] },
      ],
      'DE',
    );
    const report = buildReportMarkdown({ ...baseParams, language: 'DE', tasks });

    expect(report).toContain('# SEO-Audit: https://example.com');
    expect(report).toContain('2026-10-06');
    expect(report).toContain('**81/100**');
    expect(report).toContain('| Sicherheit | 98 |');
    expect(report).toContain('Stärkster Bereich: Sicherheit (98)');
    expect(report).toContain('Schwächster Bereich: Inhaltsqualität (59)');
    expect(report).toContain('### Diese Woche');
    expect(report).toContain('Website wird nicht über HTTPS ausgeliefert');
    expect(report).toContain('- https://example.com/a');
    expect(report).toContain('## Methodik');
  });

  it('renders an English report', () => {
    const report = buildReportMarkdown({
      ...baseParams,
      language: 'EN',
      tasks: buildAuditTasks([{ ruleId: 'NOT_HTTPS', affectedUrls: [] }], 'EN'),
    });

    expect(report).toContain('# SEO audit: https://example.com');
    expect(report).toContain('### This week');
    expect(report).toContain('## Methodology');
  });

  it('says so when there are no tasks', () => {
    expect(buildReportMarkdown({ ...baseParams, language: 'EN', tasks: [] })).toContain(
      'No actions were found.',
    );
  });

  it('lists pages that need manual review', () => {
    const report = buildReportMarkdown({
      ...baseParams,
      language: 'EN',
      tasks: [],
      assessments: [
        {
          url: 'https://example.com/unsure',
          pageType: 'OTHER',
          searchIntent: 'NONE',
          helpfulness: 2,
          specificity: 2,
          trust: 2,
          confidence: 0.3,
          needsReview: true,
        },
      ],
    });

    expect(report).toContain('## Please review manually');
    expect(report).toContain('- https://example.com/unsure');
  });

  it('warns when content quality was not assessed', () => {
    expect(
      buildReportMarkdown({ ...baseParams, language: 'EN', tasks: [], contentQualityAssessed: false }),
    ).toContain('Content quality was not assessed');
  });

  it('truncates long URL lists', () => {
    const urls = Array.from({ length: 12 }, (_, index) => `https://example.com/${index}`);
    const report = buildReportMarkdown({
      ...baseParams,
      language: 'EN',
      tasks: buildAuditTasks([{ ruleId: 'TITLE_MISSING', affectedUrls: urls }], 'EN'),
    });

    expect(report).toContain('- ... 7 more');
  });

  it('hints at DataForSEO when it is not configured', () => {
    const report = buildReportMarkdown({ ...baseParams, language: 'EN', tasks: [] });

    expect(report).toContain('DataForSEO is not set up');
    expect(report).not.toContain('## Visibility and market');
  });

  it('adds the market section when market data exists', () => {
    const report = buildReportMarkdown({
      ...baseParams,
      language: 'EN',
      tasks: [],
      isMarketDataConfigured: true,
      marketData: {
        rankings: { totalKeywords: 42, estimatedMonthlyTraffic: 100, positionCounts: null, keywords: [] },
        backlinks: null,
        backlinkTargets: [],
        competitors: [],
        costUsd: 0.1,
        notes: [],
      },
    });

    expect(report).toContain('## Visibility and market');
    expect(report).toContain('Keywords ranking on Google: 42');
    expect(report).not.toContain('DataForSEO is not set up');
  });
});
