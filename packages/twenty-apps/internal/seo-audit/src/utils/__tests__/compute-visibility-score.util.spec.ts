import { describe, expect, it } from 'vitest';

import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { computeVisibilityScore } from 'src/utils/compute-visibility-score.util';

describe('computeVisibilityScore', () => {
  it('returns null when no keyword was judged, so the area is left out', () => {
    expect(computeVisibilityScore([])).toBeNull();
    expect(
      computeVisibilityScore([buildScoredKeyword({ relevance: null, category: 'NEEDS_REVIEW' })]),
    ).toBeNull();
  });

  it('scores 100 when all relevant demand ranks in the top 3', () => {
    expect(
      computeVisibilityScore([
        buildScoredKeyword({ position: 1, category: 'TOP_3' }),
        buildScoredKeyword({ position: 3, category: 'TOP_3', searchVolume: 10 }),
      ]),
    ).toBe(100);
  });

  it('weights by search volume so a big keyword on page 2 matters more than a small one on top', () => {
    const score = computeVisibilityScore([
      buildScoredKeyword({ position: 1, category: 'TOP_3', searchVolume: 100 }),
      buildScoredKeyword({ position: 17, category: 'NEAR_PAGE_ONE', searchVolume: 10000 }),
    ]);

    expect(score).toBeGreaterThan(30);
    expect(score).toBeLessThan(40);
  });

  it('ignores keywords that are not relevant', () => {
    expect(
      computeVisibilityScore([
        buildScoredKeyword({ position: 1, category: 'TOP_3', searchVolume: 100 }),
        buildScoredKeyword({ position: 50, category: 'NOT_RELEVANT', searchVolume: 99999, relevance: 0.02 }),
      ]),
    ).toBe(100);
  });

  it('scores 0 when keywords were judged but none is relevant', () => {
    expect(
      computeVisibilityScore([buildScoredKeyword({ category: 'NOT_RELEVANT', relevance: 0.02 })]),
    ).toBe(0);
  });
});
