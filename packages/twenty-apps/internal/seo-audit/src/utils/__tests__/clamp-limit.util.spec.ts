import { describe, expect, it } from 'vitest';

import { clampLimit } from 'src/utils/clamp-limit.util';

describe('clampLimit', () => {
  it('uses the default when nothing is requested', () => {
    expect(clampLimit(undefined, 10, 50)).toBe(10);
  });

  it('uses the default for values that are not numbers', () => {
    expect(clampLimit(Number.NaN, 10, 50)).toBe(10);
  });

  it('caps at the maximum', () => {
    expect(clampLimit(500, 10, 50)).toBe(50);
  });

  it('never goes below one', () => {
    expect(clampLimit(0, 10, 50)).toBe(1);
    expect(clampLimit(-4, 10, 50)).toBe(1);
  });

  it('rounds down fractions', () => {
    expect(clampLimit(7.9, 10, 50)).toBe(7);
  });
});
