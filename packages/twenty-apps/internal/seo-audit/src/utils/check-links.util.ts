import { type CrawlResult } from 'src/types/crawl-result';
import { type Finding } from 'src/types/finding';
import { isBrokenStatusCode } from 'src/utils/is-broken-status-code.util';

export const checkLinks = ({
  pages,
  linkTargetStatusCodes,
  linksByPage,
}: CrawlResult): Finding[] => {
  const brokenTargets = Object.entries(linkTargetStatusCodes)
    .filter(([, statusCode]) => isBrokenStatusCode(statusCode))
    .map(([url]) => url);
  const findings: Finding[] = [];

  if (brokenTargets.length === 0) {
    return findings;
  }

  const homepageLinks = new Set(linksByPage[pages[0].url] ?? []);
  const brokenHomepageTargets = brokenTargets.filter((url) =>
    homepageLinks.has(url),
  );

  if (brokenHomepageTargets.length > 0) {
    findings.push({
      ruleId: 'BROKEN_LINK_ON_HOMEPAGE',
      affectedUrls: brokenHomepageTargets,
    });
  }

  findings.push({ ruleId: 'BROKEN_INTERNAL_LINKS', affectedUrls: brokenTargets });

  return findings;
};
