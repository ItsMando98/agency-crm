import { describe, expect, it } from 'vitest';

import { computeAreaScores } from 'src/utils/compute-area-scores.util';

const assessment = (helpfulness: number) => ({
  url: 'https://example.com/',
  pageType: 'SERVICE' as const,
  searchIntent: 'COMMERCIAL' as const,
  helpfulness,
  specificity: helpfulness,
  trust: helpfulness,
  confidence: 0.9,
  needsReview: false,
});

describe('computeAreaScores', () => {
  it('scores 100 in every measured area without findings and omits content quality', () => {
    expect(computeAreaScores({ findings: [], assessments: [], pageCount: 5 })).toEqual({
      CRAWLABILITY: 100,
      ON_PAGE: 100,
      LINKS: 100,
      STRUCTURED_DATA: 100,
      PERFORMANCE: 100,
      SECURITY: 100,
    });
  });

  it('subtracts penalties only from the area of the finding', () => {
    const scores = computeAreaScores({
      findings: [{ ruleId: 'NOT_HTTPS', affectedUrls: [] }],
      assessments: [],
      pageCount: 5,
    });

    expect(scores.SECURITY).toBe(70);
    expect(scores.ON_PAGE).toBe(100);
  });

  it('derives content quality from assessments, not from classifier findings', () => {
    const scores = computeAreaScores({
      findings: [{ ruleId: 'LOW_HELPFULNESS', affectedUrls: ['https://example.com/'] }],
      assessments: [assessment(5)],
      pageCount: 1,
    });

    expect(scores.CONTENT_QUALITY).toBe(100);
  });

  it('applies measured content findings on top of the assessment score', () => {
    const scores = computeAreaScores({
      findings: [{ ruleId: 'THIN_CONTENT', affectedUrls: ['https://example.com/'] }],
      assessments: [assessment(5)],
      pageCount: 1,
    });

    expect(scores.CONTENT_QUALITY).toBe(88);
  });

  it('never goes below zero', () => {
    const scores = computeAreaScores({
      findings: [
        { ruleId: 'NOT_HTTPS' as const, affectedUrls: [] },
        ...Array.from({ length: 6 }, () => ({
          ruleId: 'MIXED_CONTENT' as const,
          affectedUrls: [],
        })),
      ],
      assessments: [],
      pageCount: 1,
    });

    expect(scores.SECURITY).toBe(0);
  });
});
