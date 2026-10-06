import { describe, expect, it } from 'vitest';

import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { selectKeywordRecords } from 'src/utils/select-keyword-records.util';

describe('selectKeywordRecords', () => {
  it('keeps the best relevant keywords by volume and a few discarded ones', () => {
    const relevant = Array.from({ length: 200 }, (_, index) =>
      buildScoredKeyword({ keyword: `relevant ${index}`, searchVolume: index }),
    );
    const discarded = Array.from({ length: 30 }, (_, index) =>
      buildScoredKeyword({ keyword: `junk ${index}`, searchVolume: index, category: 'NOT_RELEVANT', relevance: 0.01 }),
    );

    const selected = selectKeywordRecords([...discarded, ...relevant]);

    expect(selected).toHaveLength(170);
    expect(selected[0].keyword).toBe('relevant 199');
    expect(selected.filter((keyword) => keyword.category === 'NOT_RELEVANT')).toHaveLength(20);
    expect(selected.find((keyword) => keyword.keyword === 'junk 29')).toBeDefined();
    expect(selected.find((keyword) => keyword.keyword === 'junk 5')).toBeUndefined();
  });

  it('returns an empty list without keywords', () => {
    expect(selectKeywordRecords([])).toEqual([]);
  });
});
