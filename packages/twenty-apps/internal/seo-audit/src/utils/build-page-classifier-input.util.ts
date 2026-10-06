import { type CrawledPage } from 'src/types/crawled-page';

export const buildPageClassifierInput = (page: CrawledPage): string =>
  [
    `URL: ${page.url}`,
    `Title: ${page.title ?? '(none)'}`,
    `Meta description: ${page.metaDescription ?? '(none)'}`,
    `H1 count: ${page.h1Count}`,
    `Word count: ${page.wordCount}`,
    '',
    'Text excerpt (may be cut off):',
    '<page_content>',
    page.textExcerpt === '' ? '(no text found)' : page.textExcerpt,
    '</page_content>',
  ].join('\n');
