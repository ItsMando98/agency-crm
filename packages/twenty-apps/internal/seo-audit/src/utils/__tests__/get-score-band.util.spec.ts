import { describe, expect, it } from 'vitest';

import { getScoreBand } from 'src/utils/get-score-band.util';

describe('getScoreBand', () => {
  it.each([
    [100, 'STRONG'],
    [80, 'STRONG'],
    [79, 'OKAY'],
    [60, 'OKAY'],
    [59, 'WEAK'],
    [0, 'WEAK'],
  ])('rates %i as %s', (score, band) => {
    expect(getScoreBand(score)).toBe(band);
  });
});
