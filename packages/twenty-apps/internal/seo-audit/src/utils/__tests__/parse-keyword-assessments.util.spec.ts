import { describe, expect, it } from 'vitest';

import { parseKeywordAssessments } from 'src/utils/parse-keyword-assessments.util';

describe('parseKeywordAssessments', () => {
  it('maps answers back to keywords by index', () => {
    expect(
      parseKeywordAssessments(
        {
          keywords: [
            { index: 1, relevance: 0.03, confidence: 0.95 },
            { index: 0, relevance: 0.9, confidence: 0.6 },
          ],
        },
        ['fliesen kaufen', 'keramik butterdose'],
      ),
    ).toEqual([
      { keyword: 'keramik butterdose', relevance: 0.03, confidence: 0.95, needsReview: false },
      { keyword: 'fliesen kaufen', relevance: 0.9, confidence: 0.6, needsReview: true },
    ]);
  });

  it('clamps values and drops invalid entries', () => {
    expect(
      parseKeywordAssessments(
        {
          keywords: [
            { index: 0, relevance: 4, confidence: -1 },
            { index: 5, relevance: 0.5, confidence: 0.5 },
            { index: 1.5, relevance: 0.5, confidence: 0.5 },
            { index: 0 },
            null,
          ],
        },
        ['a', 'b'],
      ),
    ).toEqual([{ keyword: 'a', relevance: 1, confidence: 0, needsReview: true }]);
  });

  it('returns nothing for unexpected shapes', () => {
    expect(parseKeywordAssessments(null, ['a'])).toEqual([]);
    expect(parseKeywordAssessments({ keywords: 'x' }, ['a'])).toEqual([]);
  });
});
