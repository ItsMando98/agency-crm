import { describe, expect, it } from 'vitest';

import { normalizeDomain } from '~/lib/normalize-domain';

describe('normalizeDomain', () => {
  it.each([
    ['roaswell.com', 'https://roaswell.com'],
    ['  https://www.Roaswell.com/leistungen?x=1 ', 'https://www.roaswell.com'],
    ['http://shop.example.de', 'http://shop.example.de'],
  ])('turns %j into %j', (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected);
  });

  it.each(['', 'localhost', '192.168.0.1', 'not a domain', 'user:pw@example.com', 'ftp://example.com'])(
    'refuses %j',
    (input) => {
      expect(normalizeDomain(input)).toBeNull();
    },
  );
});
