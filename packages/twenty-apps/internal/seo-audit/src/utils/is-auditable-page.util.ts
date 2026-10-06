import { type CrawledPage } from 'src/types/crawled-page';

export const isAuditablePage = (page: CrawledPage): boolean =>
  page.isHtml && page.statusCode >= 200 && page.statusCode < 400;
