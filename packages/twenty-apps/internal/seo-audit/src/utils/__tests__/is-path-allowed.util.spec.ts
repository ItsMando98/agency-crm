import { describe, expect, it } from 'vitest';

import { isPathAllowed } from 'src/utils/is-path-allowed.util';

describe('isPathAllowed', () => {
  it('allows everything without disallow rules', () => {
    expect(isPathAllowed('/anything', { allowRules: [], disallowRules: [] })).toBe(true);
  });

  it('blocks matching prefixes', () => {
    const rules = { allowRules: [], disallowRules: ['/admin'] };

    expect(isPathAllowed('/admin/users', rules)).toBe(false);
    expect(isPathAllowed('/blog', rules)).toBe(true);
  });

  it('lets the longer allow rule win over a shorter disallow rule', () => {
    const rules = { allowRules: ['/admin/public'], disallowRules: ['/admin'] };

    expect(isPathAllowed('/admin/public/page', rules)).toBe(true);
    expect(isPathAllowed('/admin/secret', rules)).toBe(false);
  });

  it('supports wildcards and the end anchor', () => {
    const rules = { allowRules: [], disallowRules: ['/*.pdf$', '/search*?q='] };

    expect(isPathAllowed('/docs/file.pdf', rules)).toBe(false);
    expect(isPathAllowed('/docs/file.pdf.html', rules)).toBe(true);
    expect(isPathAllowed('/search/all?q=test', rules)).toBe(false);
  });

  it('blocks the whole site for Disallow: /', () => {
    expect(isPathAllowed('/', { allowRules: [], disallowRules: ['/'] })).toBe(false);
  });
});
