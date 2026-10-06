import { describe, expect, it } from 'vitest';

import { computeContentQualityScore } from 'src/utils/compute-content-quality-score.util';

const assessment = (helpfulness: number, specificity: number, trust: number) => ({
  url: 'https://example.com/',
  pageType: 'SERVICE' as const,
  searchIntent: 'COMMERCIAL' as const,
  helpfulness,
  specificity,
  trust,
  confidence: 0.9,
  needsReview: false,
});

describe('computeContentQualityScore', () => {
  it('returns null without assessments', () => {
    expect(computeContentQualityScore([])).toBeNull();
  });

  it('maps ratings 1 to 0 and 5 to 100', () => {
    expect(computeContentQualityScore([assessment(1, 1, 1)])).toBe(0);
    expect(computeContentQualityScore([assessment(5, 5, 5)])).toBe(100);
  });

  it('weights helpfulness twice as much as specificity or trust', () => {
    expect(computeContentQualityScore([assessment(5, 1, 1)])).toBe(50);
    expect(computeContentQualityScore([assessment(1, 5, 1)])).toBe(25);
  });

  it('averages over pages', () => {
    expect(computeContentQualityScore([assessment(1, 1, 1), assessment(5, 5, 5)])).toBe(50);
  });
});
