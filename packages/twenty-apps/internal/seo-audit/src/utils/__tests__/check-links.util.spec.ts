import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { type CrawlResult } from 'src/types/crawl-result';
import { checkLinks } from 'src/utils/check-links.util';

const HOME = 'https://example.com/';

const buildCrawlResult = (
  linkTargetStatusCodes: Record<string, number>,
  linksByPage: Record<string, string[]>,
): CrawlResult => ({
  origin: 'https://example.com',
  pages: [buildCrawledPage({ url: HOME })],
  linkTargetStatusCodes,
  linksByPage,
  robotsTxtFound: true,
  sitemapFound: true,
  blockedByRobotsCount: 0,
});

describe('checkLinks', () => {
  it('returns nothing when every target works', () => {
    expect(checkLinks(buildCrawlResult({ [HOME]: 200, 'https://example.com/a': 200 }, {}))).toEqual([]);
  });

  it('reports broken targets and singles out the ones linked from the homepage', () => {
    const findings = checkLinks(
      buildCrawlResult(
        { [HOME]: 200, 'https://example.com/gone': 404, 'https://example.com/old': 410 },
        { [HOME]: ['https://example.com/gone'] },
      ),
    );

    expect(findings).toEqual([
      { ruleId: 'BROKEN_LINK_ON_HOMEPAGE', affectedUrls: ['https://example.com/gone'] },
      {
        ruleId: 'BROKEN_INTERNAL_LINKS',
        affectedUrls: ['https://example.com/gone', 'https://example.com/old'],
      },
    ]);
  });

  it('does not treat access control, rate limits, timeouts or server errors as dead links', () => {
    expect(
      checkLinks(
        buildCrawlResult(
          {
            'https://example.com/a': 401,
            'https://example.com/b': 403,
            'https://example.com/c': 429,
            'https://example.com/d': 0,
            'https://example.com/e': 503,
          },
          {},
        ),
      ),
    ).toEqual([]);
  });
});
