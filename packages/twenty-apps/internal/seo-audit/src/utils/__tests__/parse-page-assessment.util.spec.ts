import { describe, expect, it } from 'vitest';

import { parsePageAssessment } from 'src/utils/parse-page-assessment.util';

const VALID = {
  pageType: 'SERVICE',
  searchIntent: 'COMMERCIAL',
  helpfulness: 4,
  specificity: 3,
  trust: 5,
  confidence: 0.9,
};

describe('parsePageAssessment', () => {
  it('maps a valid answer and keeps confident pages out of manual review', () => {
    expect(parsePageAssessment('https://example.com/', VALID)).toEqual({
      url: 'https://example.com/',
      ...VALID,
      needsReview: false,
    });
  });

  it('marks low confidence for review', () => {
    expect(parsePageAssessment('https://example.com/', { ...VALID, confidence: 0.67 })?.needsReview).toBe(true);
  });

  it('clamps confidence into 0 to 1', () => {
    expect(parsePageAssessment('u', { ...VALID, confidence: 7 })?.confidence).toBe(1);
    expect(parsePageAssessment('u', { ...VALID, confidence: -1 })?.confidence).toBe(0);
  });

  it.each([
    ['not an object', 'text'],
    ['null', null],
    ['unknown page type', { ...VALID, pageType: 'BLOG' }],
    ['unknown intent', { ...VALID, searchIntent: 'FUN' }],
    ['rating out of range', { ...VALID, helpfulness: 6 }],
    ['fractional rating', { ...VALID, trust: 2.5 }],
    ['missing confidence', { ...VALID, confidence: undefined }],
    ['NaN confidence', { ...VALID, confidence: Number.NaN }],
  ])('rejects %s', (_label, raw) => {
    expect(parsePageAssessment('u', raw)).toBeNull();
  });
});
