import { describe, expect, it } from 'vitest';

import { compareAudits } from '~/lib/compare-audits';

describe('compareAudits', () => {
  it('reports the score and area changes, worst change first', () => {
    const result = compareAudits(
      { score: 74, areaScores: { ON_PAGE: 85, AI_VISIBILITY: 27, LINKS: 100 } },
      { score: 70, areaScores: { ON_PAGE: 80, AI_VISIBILITY: 40, LINKS: 100 } },
    );

    expect(result.scoreDelta).toBe(4);
    expect(result.areaDeltas.map((entry) => [entry.area, entry.delta])).toEqual([
      ['AI_VISIBILITY', -13],
      ['LINKS', 0],
      ['ON_PAGE', 5],
    ]);
  });

  it('lists areas that exist in only one audit instead of inventing a change', () => {
    const result = compareAudits(
      { score: 80, areaScores: { ON_PAGE: 85, AI_VISIBILITY: 27 } },
      { score: 78, areaScores: { ON_PAGE: 80, SECURITY: 100 } },
    );

    expect(result.onlyInCurrent).toEqual(['AI_VISIBILITY']);
    expect(result.onlyInPrevious).toEqual(['SECURITY']);
    expect(result.areaDeltas).toHaveLength(1);
  });

  it('has no score change when one score is missing', () => {
    expect(compareAudits({ score: null, areaScores: {} }, { score: 70, areaScores: {} }).scoreDelta).toBeNull();
  });
});
