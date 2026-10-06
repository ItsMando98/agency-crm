import { SLOW_RESPONSE_THRESHOLD_MS } from 'src/constants/seo-thresholds.const';
import { type CrawledPage } from 'src/types/crawled-page';
import { type Finding } from 'src/types/finding';
import { isAuditablePage } from 'src/utils/is-auditable-page.util';

export const checkPerformance = (pages: CrawledPage[]): Finding[] => {
  const slowUrls = pages
    .filter(
      (page) =>
        isAuditablePage(page) && page.responseTimeMs > SLOW_RESPONSE_THRESHOLD_MS,
    )
    .map((page) => page.url);

  return slowUrls.length > 0
    ? [{ ruleId: 'SLOW_PAGES', affectedUrls: slowUrls }]
    : [];
};
