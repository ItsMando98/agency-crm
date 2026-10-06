import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { buildPageRecordData } from 'src/utils/build-page-record-data.util';

describe('buildPageRecordData', () => {
  it('maps page metrics and the assessment', () => {
    const data = buildPageRecordData('audit-1', buildCrawledPage({ url: 'https://example.com/a', wordCount: 321 }), {
      url: 'https://example.com/a',
      pageType: 'SERVICE',
      searchIntent: 'COMMERCIAL',
      helpfulness: 4,
      specificity: 3,
      trust: 2,
      confidence: 0.55,
      needsReview: true,
    });

    expect(data).toMatchObject({
      seoAuditId: 'audit-1',
      url: 'https://example.com/a',
      wordCount: 321,
      pageType: 'SERVICE',
      helpfulness: 4,
      confidence: 0.55,
      needsReview: true,
    });
  });

  it('leaves the assessment fields empty for unassessed pages', () => {
    expect(buildPageRecordData('audit-1', buildCrawledPage(), undefined)).toMatchObject({
      pageType: null,
      helpfulness: null,
      needsReview: false,
    });
  });
});
