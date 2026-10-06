import { describe, expect, it } from 'vitest';

import { parseMaxPagesInput } from 'src/front-components/utils/parse-max-pages-input.util';

describe('parseMaxPagesInput', () => {
  it('keeps valid numbers and rounds down', () => {
    expect(parseMaxPagesInput('25')).toBe('25');
    expect(parseMaxPagesInput('12.8')).toBe('12');
  });

  it('caps at the crawler limit', () => {
    expect(parseMaxPagesInput('500')).toBe('60');
  });

  it.each(['', '  ', '0', '-3', 'abc'])('rejects %j', (input) => {
    expect(parseMaxPagesInput(input)).toBeNull();
  });
});
