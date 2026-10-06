import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { buildPageClassifierInput } from 'src/utils/build-page-classifier-input.util';

describe('buildPageClassifierInput', () => {
  it('wraps the page text so it is clearly marked as content', () => {
    const input = buildPageClassifierInput(
      buildCrawledPage({ url: 'https://example.com/a', title: 'Title', textExcerpt: 'Hello there' }),
    );

    expect(input).toContain('URL: https://example.com/a');
    expect(input).toContain('Title: Title');
    expect(input).toContain('<page_content>\nHello there\n</page_content>');
  });

  it('makes missing fields explicit', () => {
    const input = buildPageClassifierInput(
      buildCrawledPage({ title: null, metaDescription: null, textExcerpt: '' }),
    );

    expect(input).toContain('Title: (none)');
    expect(input).toContain('Meta description: (none)');
    expect(input).toContain('(no text found)');
  });
});
