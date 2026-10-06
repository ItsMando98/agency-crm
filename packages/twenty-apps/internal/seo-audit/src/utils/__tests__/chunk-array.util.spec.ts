import { describe, expect, it } from 'vitest';

import { chunkArray } from 'src/utils/chunk-array.util';

describe('chunkArray', () => {
  it('splits into chunks of the given size', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns no chunks for an empty list', () => {
    expect(chunkArray([], 3)).toEqual([]);
  });
});
