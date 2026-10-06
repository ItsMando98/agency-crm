import { describe, expect, it } from 'vitest';

import { resolveInternalLink } from 'src/utils/resolve-internal-link.util';

const ORIGIN = 'https://example.com';
const BASE = 'https://example.com/services/';

describe('resolveInternalLink', () => {
  it('resolves relative links against the page URL', () => {
    expect(resolveInternalLink('plumbing', BASE, ORIGIN)).toBe(
      'https://example.com/services/plumbing',
    );
    expect(resolveInternalLink('/contact', BASE, ORIGIN)).toBe(
      'https://example.com/contact',
    );
  });

  it('removes fragments and tracking parameters but keeps real parameters', () => {
    expect(
      resolveInternalLink('/shop?page=2&utm_source=x&gclid=1#top', BASE, ORIGIN),
    ).toBe('https://example.com/shop?page=2');
  });

  it('treats the www variant as the same site and normalizes the host', () => {
    expect(resolveInternalLink('https://www.example.com/a', BASE, ORIGIN)).toBe(
      'https://example.com/a',
    );
  });

  it.each([
    '',
    '#section',
    'mailto:info@example.com',
    'tel:+4930123',
    'javascript:void(0)',
    'https://other.com/page',
    '/files/brochure.pdf',
    '/img/logo.PNG',
  ])('ignores %s', (href) => {
    expect(resolveInternalLink(href, BASE, ORIGIN)).toBeNull();
  });

  it('keeps paths whose dot is not a file extension', () => {
    expect(resolveInternalLink('/about.us/team', BASE, ORIGIN)).toBe(
      'https://example.com/about.us/team',
    );
  });
});
