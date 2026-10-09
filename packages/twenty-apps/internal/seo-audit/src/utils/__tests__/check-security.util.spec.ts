import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { type CrawlResult } from 'src/types/crawl-result';
import { checkSecurity } from 'src/utils/check-security.util';

const buildCrawlResult = (origin: string, insecureResourceUrls: string[] = []): CrawlResult => ({
  origin,
  pages: [buildCrawledPage({ insecureResourceUrls })],
  linkTargetStatusCodes: {},
  linksByPage: {},
  robotsTxtFound: true,
  robotsTxt: null,
  llmsTxtFound: false,
  sitemapFound: true,
  blockedByRobotsCount: 0,
});

describe('checkSecurity', () => {
  it('passes a clean https site', () => {
    expect(checkSecurity(buildCrawlResult('https://example.com'))).toEqual([]);
  });

  it('flags a site that is not served over https', () => {
    expect(checkSecurity(buildCrawlResult('http://example.com'))).toEqual([
      { ruleId: 'NOT_HTTPS', affectedUrls: [] },
    ]);
  });

  it('flags pages with insecure resources', () => {
    expect(
      checkSecurity(buildCrawlResult('https://example.com', ['http://example.com/a.jpg'])),
    ).toEqual([{ ruleId: 'MIXED_CONTENT', affectedUrls: ['https://example.com/'] }]);
  });
});
