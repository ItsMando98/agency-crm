import { type CrawlResult } from 'src/types/crawl-result';
import { type Finding } from 'src/types/finding';
import { isAuditablePage } from 'src/utils/is-auditable-page.util';

export const checkCrawlability = ({
  pages,
  robotsTxtFound,
  sitemapFound,
}: CrawlResult): Finding[] => {
  const [homepage, ...otherPages] = pages;
  const findings: Finding[] = [];

  if (homepage.isNoindex) {
    findings.push({ ruleId: 'HOMEPAGE_NOINDEX', affectedUrls: [homepage.url] });
  }

  const serverErrorUrls = pages
    .filter((page) => page.statusCode >= 500)
    .map((page) => page.url);

  if (serverErrorUrls.length > 0) {
    findings.push({ ruleId: 'PAGES_SERVER_ERROR', affectedUrls: serverErrorUrls });
  }

  if (!robotsTxtFound) {
    findings.push({ ruleId: 'ROBOTS_TXT_MISSING', affectedUrls: [] });
  }

  if (!sitemapFound) {
    findings.push({ ruleId: 'SITEMAP_MISSING', affectedUrls: [] });
  }

  const missingViewportUrls = pages
    .filter((page) => isAuditablePage(page) && !page.hasViewport)
    .map((page) => page.url);

  if (missingViewportUrls.length > 0) {
    findings.push({ ruleId: 'VIEWPORT_MISSING', affectedUrls: missingViewportUrls });
  }

  const noindexUrls = otherPages
    .filter((page) => page.isNoindex)
    .map((page) => page.url);

  if (noindexUrls.length > 0) {
    findings.push({ ruleId: 'PAGES_NOINDEX', affectedUrls: noindexUrls });
  }

  return findings;
};
