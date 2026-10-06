import { describe, expect, it } from 'vitest';

import { formatNumber } from 'src/utils/format-number.util';

describe('formatNumber', () => {
  it('uses the thousands separator of the report language', () => {
    expect(formatNumber(261000, 'DE')).toBe('261.000');
    expect(formatNumber(261000, 'EN')).toBe('261,000');
  });

  it('rounds to whole numbers', () => {
    expect(formatNumber(12.6, 'EN')).toBe('13');
  });
});
