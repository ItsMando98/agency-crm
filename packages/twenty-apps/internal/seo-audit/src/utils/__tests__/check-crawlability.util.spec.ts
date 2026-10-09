import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { type CrawlResult } from 'src/types/crawl-result';
import { checkCrawlability } from 'src/utils/check-crawlability.util';

const buildCrawlResult = (overrides: Partial<CrawlResult> = {}): CrawlResult => ({
  origin: 'https://example.com',
  pages: [buildCrawledPage()],
  linkTargetStatusCodes: {},
  linksByPage: {},
  robotsTxtFound: true,
  robotsTxt: null,
  llmsTxtFound: false,
  sitemapFound: true,
  blockedByRobotsCount: 0,
  ...overrides,
});

const ruleIds = (crawlResult: CrawlResult) =>
  checkCrawlability(crawlResult).map((finding) => finding.ruleId).sort();

describe('checkCrawlability', () => {
  it('returns no findings for a healthy site', () => {
    expect(ruleIds(buildCrawlResult())).toEqual([]);
  });

  it('flags a noindex homepage as critical rule hit', () => {
    expect(ruleIds(buildCrawlResult({ pages: [buildCrawledPage({ isNoindex: true })] }))).toEqual([
      'HOMEPAGE_NOINDEX',
    ]);
  });

  it('separates noindex on the homepage from noindex elsewhere', () => {
    const result = buildCrawlResult({
      pages: [buildCrawledPage(), buildCrawledPage({ url: 'https://example.com/x', isNoindex: true })],
    });

    expect(ruleIds(result)).toEqual(['PAGES_NOINDEX']);
  });

  it('flags server errors, missing robots.txt, sitemap and viewport', () => {
    const result = buildCrawlResult({
      pages: [
        buildCrawledPage({ hasViewport: false }),
        buildCrawledPage({ url: 'https://example.com/err', statusCode: 500, isHtml: false }),
      ],
      robotsTxtFound: false,
      robotsTxt: null,
      llmsTxtFound: false,
      sitemapFound: false,
    });

    expect(ruleIds(result)).toEqual([
      'PAGES_SERVER_ERROR',
      'ROBOTS_TXT_MISSING',
      'SITEMAP_MISSING',
      'VIEWPORT_MISSING',
    ]);
  });
});
