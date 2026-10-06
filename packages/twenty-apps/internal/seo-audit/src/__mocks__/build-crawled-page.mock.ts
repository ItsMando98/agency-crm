import { type CrawledPage } from 'src/types/crawled-page';

export const buildCrawledPage = (
  overrides: Partial<CrawledPage> = {},
): CrawledPage => ({
  url: 'https://example.com/',
  statusCode: 200,
  responseTimeMs: 300,
  contentType: 'text/html',
  isHtml: true,
  title: 'Example company: plumbing services in Berlin',
  metaDescription: 'We repair pipes and boilers in Berlin, same day service.',
  canonicalUrl: 'https://example.com/',
  robotsMeta: null,
  isNoindex: false,
  lang: 'en',
  hasViewport: true,
  h1Count: 1,
  wordCount: 400,
  imageCount: 2,
  imagesWithoutAlt: 0,
  insecureResourceUrls: [],
  internalLinks: [],
  structuredDataTypes: ['LocalBusiness'],
  textExcerpt: 'We repair pipes and boilers in Berlin.',
  ...overrides,
});
