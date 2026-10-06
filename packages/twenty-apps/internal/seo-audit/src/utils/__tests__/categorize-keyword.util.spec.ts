import { describe, expect, it } from 'vitest';

import { categorizeKeyword } from 'src/utils/categorize-keyword.util';

const assessment = (relevance: number, confidence = 0.9) => ({
  keyword: 'k',
  relevance,
  confidence,
  needsReview: confidence < 0.7,
});

describe('categorizeKeyword', () => {
  it.each([
    [1, 'TOP_3'],
    [3, 'TOP_3'],
    [4, 'QUICK_WIN'],
    [10, 'QUICK_WIN'],
    [11, 'NEAR_PAGE_ONE'],
    [30, 'NEAR_PAGE_ONE'],
    [31, 'LOW_RANKING'],
  ])('puts a relevant keyword at position %i into %s', (position, category) => {
    expect(categorizeKeyword(position, assessment(0.9))).toBe(category);
  });

  it('discards keywords that do not fit the business, like a ceramic butter dish for a tile shop', () => {
    expect(categorizeKeyword(2, assessment(0.03))).toBe('NOT_RELEVANT');
  });

  it('sends unsure or unjudged keywords to review instead of deciding', () => {
    expect(categorizeKeyword(2, assessment(0.9, 0.5))).toBe('NEEDS_REVIEW');
    expect(categorizeKeyword(2, assessment(0.01, 0.5))).toBe('NEEDS_REVIEW');
    expect(categorizeKeyword(2, undefined)).toBe('NEEDS_REVIEW');
  });

  it('treats the relevance threshold as relevant', () => {
    expect(categorizeKeyword(5, assessment(0.5))).toBe('QUICK_WIN');
  });
});
