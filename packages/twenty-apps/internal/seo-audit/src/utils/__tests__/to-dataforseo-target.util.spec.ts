import { describe, expect, it } from 'vitest';

import { toDataForSeoTarget } from 'src/utils/to-dataforseo-target.util';

describe('toDataForSeoTarget', () => {
  it('strips scheme, path and www', () => {
    expect(toDataForSeoTarget('https://www.example.com')).toBe('example.com');
    expect(toDataForSeoTarget('http://shop.example.com')).toBe('shop.example.com');
  });
});
