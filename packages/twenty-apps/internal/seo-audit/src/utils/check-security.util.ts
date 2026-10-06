import { type CrawlResult } from 'src/types/crawl-result';
import { type Finding } from 'src/types/finding';

export const checkSecurity = ({ origin, pages }: CrawlResult): Finding[] => {
  const findings: Finding[] = [];

  if (origin.startsWith('http://')) {
    findings.push({ ruleId: 'NOT_HTTPS', affectedUrls: [] });
  }

  const mixedContentUrls = pages
    .filter((page) => page.insecureResourceUrls.length > 0)
    .map((page) => page.url);

  if (mixedContentUrls.length > 0) {
    findings.push({ ruleId: 'MIXED_CONTENT', affectedUrls: mixedContentUrls });
  }

  return findings;
};
