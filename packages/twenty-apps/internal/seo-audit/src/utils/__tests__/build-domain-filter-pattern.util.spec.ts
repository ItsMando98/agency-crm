import { describe, expect, it } from 'vitest';

import { buildDomainFilterPattern } from 'src/utils/build-domain-filter-pattern.util';

describe('buildDomainFilterPattern', () => {
  it('matches a bare domain', () => {
    expect(buildDomainFilterPattern('Example.com')).toBe('%example.com%');
  });

  it('ignores scheme, www and path', () => {
    expect(buildDomainFilterPattern('https://www.example.com/about?x=1')).toBe('%example.com%');
  });

  it('trims whitespace', () => {
    expect(buildDomainFilterPattern('  example.com ')).toBe('%example.com%');
  });
});
