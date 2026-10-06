import {
  CRAWL_CONCURRENCY,
  CRAWL_TIME_BUDGET_MS,
  MAX_CRAWLED_PAGES,
  MAX_LINK_TARGET_CHECKS,
  SITEMAP_NESTING_LIMIT,
} from 'src/constants/crawl.const';
import { type CrawlResult } from 'src/types/crawl-result';
import { type CrawledPage } from 'src/types/crawled-page';
import { extractPageData } from 'src/utils/extract-page-data.util';
import { fetchPage } from 'src/utils/fetch-page.util';
import { isPathAllowed } from 'src/utils/is-path-allowed.util';
import { parseRobotsRules } from 'src/utils/parse-robots-rules.util';
import { parseSitemapUrls } from 'src/utils/parse-sitemap-urls.util';
import { resolveInternalLink } from 'src/utils/resolve-internal-link.util';
import { runWithConcurrency } from 'src/utils/run-with-concurrency.util';

type CrawlWebsiteParams = {
  origin: string;
  maxPages?: number;
  fetchImplementation?: typeof fetch;
};

const isHtmlContentType = (contentType: string | null): boolean =>
  /html/i.test(contentType ?? '');

export const crawlWebsite = async ({
  origin,
  maxPages = MAX_CRAWLED_PAGES,
  fetchImplementation = fetch,
}: CrawlWebsiteParams): Promise<CrawlResult> => {
  const startedAt = Date.now();
  const fetchWith = (url: string, method: 'GET' | 'HEAD' = 'GET') =>
    fetchPage({ url, method, fetchImplementation });

  const homepageResponse = await fetchWith(`${origin}/`);

  if (homepageResponse.statusCode === 0 || homepageResponse.statusCode >= 400) {
    throw new Error(
      `Homepage is not reachable (${homepageResponse.errorMessage ?? `HTTP ${homepageResponse.statusCode}`})`,
    );
  }

  const siteOrigin = new URL(homepageResponse.url).origin;
  const robotsResponse = await fetchWith(`${siteOrigin}/robots.txt`);
  const robotsTxtFound =
    robotsResponse.statusCode === 200 &&
    robotsResponse.body !== null &&
    !isHtmlContentType(robotsResponse.contentType);
  const robotsRules = parseRobotsRules(robotsTxtFound ? (robotsResponse.body ?? '') : '');

  const sitemapQueue = (
    robotsRules.sitemapUrls.length > 0
      ? robotsRules.sitemapUrls
      : [`${siteOrigin}/sitemap.xml`]
  ).map((url) => ({ url, depth: 0 }));
  const sitemapPageUrls: string[] = [];
  let sitemapFound = false;

  while (sitemapQueue.length > 0 && sitemapPageUrls.length < maxPages * 5) {
    const next = sitemapQueue.shift();

    if (next === undefined) {
      break;
    }

    const sitemapResponse = await fetchWith(next.url);
    const body = sitemapResponse.body ?? '';

    if (
      sitemapResponse.statusCode !== 200 ||
      (!body.includes('<urlset') && !body.includes('<sitemapindex'))
    ) {
      continue;
    }

    sitemapFound = true;

    const parsed = parseSitemapUrls(body);

    sitemapPageUrls.push(...parsed.pageUrls);

    if (next.depth < SITEMAP_NESTING_LIMIT) {
      sitemapQueue.push(
        ...parsed.sitemapUrls.map((url) => ({ url, depth: next.depth + 1 })),
      );
    }
  }

  const pages: CrawledPage[] = [];
  const crawledUrls = new Set<string>();
  const queuedUrls = new Set<string>();
  const queue: string[] = [];
  let blockedByRobotsCount = 0;

  const enqueue = (url: string | null): void => {
    if (url === null || queuedUrls.has(url) || crawledUrls.has(url)) {
      return;
    }

    queuedUrls.add(url);
    queue.push(url);
  };

  const homepage = extractPageData({
    html: homepageResponse.body,
    pageUrl: homepageResponse.url,
    origin: siteOrigin,
    statusCode: homepageResponse.statusCode,
    responseTimeMs: homepageResponse.responseTimeMs,
    contentType: homepageResponse.contentType,
    xRobotsTag: homepageResponse.xRobotsTag,
  });

  pages.push(homepage);
  crawledUrls.add(homepage.url);
  queuedUrls.add(homepage.url);
  homepage.internalLinks.forEach(enqueue);
  sitemapPageUrls.forEach((url) =>
    enqueue(resolveInternalLink(url, siteOrigin, siteOrigin)),
  );

  const requestedStatusCodes: Record<string, number> = {};

  const crawlOne = async (
    url: string,
  ): Promise<{ requestedUrl: string; page: CrawledPage } | null> => {
    const { pathname, search } = new URL(url);

    if (!isPathAllowed(`${pathname}${search}`, robotsRules)) {
      blockedByRobotsCount += 1;

      return null;
    }

    const response = await fetchWith(url);

    return {
      requestedUrl: url,
      page: extractPageData({
        html: response.body,
        pageUrl: response.url,
        origin: siteOrigin,
        statusCode: response.statusCode,
        responseTimeMs: response.responseTimeMs,
        contentType: response.contentType,
        xRobotsTag: response.xRobotsTag,
      }),
    };
  };

  while (
    queue.length > 0 &&
    pages.length < maxPages &&
    Date.now() - startedAt < CRAWL_TIME_BUDGET_MS
  ) {
    const wave = queue.splice(0, Math.min(CRAWL_CONCURRENCY * 2, maxPages - pages.length));
    const crawled = await runWithConcurrency(wave, CRAWL_CONCURRENCY, crawlOne);

    for (const result of crawled) {
      if (result === null) {
        continue;
      }

      requestedStatusCodes[result.requestedUrl] = result.page.statusCode;

      // A redirect that lands on an already crawled page must not count twice.
      if (crawledUrls.has(result.page.url)) {
        continue;
      }

      pages.push(result.page);
      crawledUrls.add(result.page.url);
      result.page.internalLinks.forEach(enqueue);
    }
  }

  const linksByPage: Record<string, string[]> = {};
  const linkTargetStatusCodes: Record<string, number> = { ...requestedStatusCodes };

  for (const page of pages) {
    linksByPage[page.url] = page.internalLinks;
    linkTargetStatusCodes[page.url] = page.statusCode;
  }

  const uncheckedTargets = [
    ...new Set(pages.flatMap((page) => page.internalLinks)),
  ]
    .filter((url) => linkTargetStatusCodes[url] === undefined)
    .slice(0, MAX_LINK_TARGET_CHECKS);

  const checkedTargets = await runWithConcurrency(
    uncheckedTargets,
    CRAWL_CONCURRENCY,
    async (url) => {
      const headResponse = await fetchWith(url, 'HEAD');

      if (headResponse.statusCode === 405 || headResponse.statusCode === 501) {
        return { url, statusCode: (await fetchWith(url)).statusCode };
      }

      return { url, statusCode: headResponse.statusCode };
    },
  );

  for (const { url, statusCode } of checkedTargets) {
    linkTargetStatusCodes[url] = statusCode;
  }

  return {
    origin: siteOrigin,
    pages,
    linkTargetStatusCodes,
    linksByPage,
    robotsTxtFound,
    sitemapFound,
    blockedByRobotsCount,
  };
};
