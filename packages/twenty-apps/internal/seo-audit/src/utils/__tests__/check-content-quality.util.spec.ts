import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { type PageAssessment } from 'src/types/page-assessment';
import { checkContentQuality } from 'src/utils/check-content-quality.util';

const buildAssessment = (overrides: Partial<PageAssessment> = {}): PageAssessment => ({
  url: 'https://example.com/',
  pageType: 'SERVICE',
  searchIntent: 'COMMERCIAL',
  helpfulness: 4,
  specificity: 4,
  trust: 4,
  confidence: 0.9,
  needsReview: false,
  ...overrides,
});

describe('checkContentQuality', () => {
  it('returns nothing for good content', () => {
    expect(checkContentQuality([buildCrawledPage()], [buildAssessment()])).toEqual([]);
  });

  it('flags thin pages but not contact and legal pages', () => {
    const pages = [
      buildCrawledPage({ url: 'https://example.com/thin', wordCount: 40 }),
      buildCrawledPage({ url: 'https://example.com/contact', wordCount: 20 }),
    ];
    const assessments = [buildAssessment({ url: 'https://example.com/contact', pageType: 'CONTACT' })];

    expect(checkContentQuality(pages, assessments)).toEqual([
      { ruleId: 'THIN_CONTENT', affectedUrls: ['https://example.com/thin'] },
    ]);
  });

  it('flags low helpfulness, specificity and trust from confident assessments', () => {
    const findings = checkContentQuality(
      [buildCrawledPage()],
      [buildAssessment({ helpfulness: 1, specificity: 2, trust: 2 })],
    );

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      'LOW_HELPFULNESS',
      'LOW_SPECIFICITY',
      'LOW_TRUST',
    ]);
  });

  it('leaves uncertain assessments out of the findings', () => {
    expect(
      checkContentQuality(
        [buildCrawledPage()],
        [buildAssessment({ helpfulness: 1, needsReview: true, confidence: 0.4 })],
      ),
    ).toEqual([]);
  });
});
