import { describe, expect, it } from 'vitest';

import { formatDecimal } from 'src/utils/format-decimal.util';

describe('formatDecimal', () => {
  it('uses a decimal comma in German', () => {
    expect(formatDecimal(7.138, 'DE', 1)).toBe('7,1');
  });

  it('uses a decimal point in English', () => {
    expect(formatDecimal(7.138, 'EN', 1)).toBe('7.1');
  });

  it('keeps trailing zeros so values line up', () => {
    expect(formatDecimal(3, 'DE', 1)).toBe('3,0');
    expect(formatDecimal(0.1, 'EN', 2)).toBe('0.10');
  });
});
