import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportAppendixHtml } from 'src/utils/build-report-appendix-html.util';

describe('buildReportAppendixHtml', () => {
  it('lists unsure pages and keywords and always ends with the methodology', () => {
    const html = buildReportAppendixHtml(buildSeoAuditResult({ language: 'EN' }));

    expect(html).toContain('Please review manually');
    expect(html).toContain('https://kanzlei-beispiel.de/unsicher');
    expect(html).toContain('unklarer begriff');
    expect(html).toContain('Methodology');
  });

  it('skips the review block when nothing is unsure', () => {
    const html = buildReportAppendixHtml(
      buildSeoAuditResult({ language: 'EN', assessments: [], keywords: [] }),
    );

    expect(html).not.toContain('Please review manually');
    expect(html).toContain('Methodology');
  });

  it('caps long review lists', () => {
    const assessments = Array.from({ length: 40 }, (_, index) => ({
      url: `https://kanzlei-beispiel.de/p${index}`,
      pageType: 'OTHER' as const,
      searchIntent: 'NONE' as const,
      helpfulness: 2,
      specificity: 2,
      trust: 2,
      confidence: 0.2,
      needsReview: true,
    }));
    const html = buildReportAppendixHtml(buildSeoAuditResult({ language: 'EN', assessments, keywords: [] }));

    expect(html).toContain('and 15 more');
  });
});
