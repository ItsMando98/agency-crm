import { describe, expect, it } from 'vitest';

import { asFiniteNumber } from 'src/utils/as-finite-number.util';

describe('asFiniteNumber', () => {
  it('returns finite numbers only', () => {
    expect(asFiniteNumber(3)).toBe(3);
    expect(asFiniteNumber(0)).toBe(0);
    expect(asFiniteNumber(Number.NaN)).toBeNull();
    expect(asFiniteNumber(Number.POSITIVE_INFINITY)).toBeNull();
    expect(asFiniteNumber('3')).toBeNull();
  });
});
