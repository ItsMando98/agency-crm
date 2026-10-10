import { describe, expect, it } from 'vitest';

import { scoreKeywords } from 'src/utils/score-keywords.util';

const keyword = (text: string, position: number) => ({
  keyword: text,
  position,
  searchVolume: 100,
  estimatedTraffic: 1,
  url: null,
});

describe('scoreKeywords', () => {
  it('joins assessments case-insensitively and categorizes', () => {
    const scored = scoreKeywords(
      [keyword('Kündigungsfrist', 17), keyword('keramik butterdose', 2), keyword('unjudged', 5)],
      [
        { keyword: 'kündigungsfrist', relevance: 0.9, confidence: 0.9, needsReview: false, place: null },
        { keyword: 'keramik butterdose', relevance: 0.03, confidence: 0.95, needsReview: false, place: null },
      ],
    );

    expect(scored.map((entry) => [entry.keyword, entry.category, entry.relevance, entry.needsReview])).toEqual([
      ['Kündigungsfrist', 'NEAR_PAGE_ONE', 0.9, false],
      ['keramik butterdose', 'NOT_RELEVANT', 0.03, false],
      ['unjudged', 'NEEDS_REVIEW', null, true],
    ]);
  });
});
