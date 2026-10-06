import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { findDuplicateUrls } from 'src/utils/find-duplicate-urls.util';

describe('findDuplicateUrls', () => {
  it('returns all URLs that share a value, ignoring case and whitespace', () => {
    const pages = [
      buildCrawledPage({ url: 'https://example.com/a', title: 'Same title' }),
      buildCrawledPage({ url: 'https://example.com/b', title: ' same TITLE ' }),
      buildCrawledPage({ url: 'https://example.com/c', title: 'Other' }),
    ];

    expect(findDuplicateUrls(pages, (page) => page.title)).toEqual([
      'https://example.com/a',
      'https://example.com/b',
    ]);
  });

  it('ignores missing and empty values', () => {
    const pages = [
      buildCrawledPage({ url: 'https://example.com/a', title: null }),
      buildCrawledPage({ url: 'https://example.com/b', title: null }),
      buildCrawledPage({ url: 'https://example.com/c', title: '  ' }),
    ];

    expect(findDuplicateUrls(pages, (page) => page.title)).toEqual([]);
  });
});
