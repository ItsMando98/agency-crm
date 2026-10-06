import { type CrawledPage } from 'src/types/crawled-page';
import { type PageAssessment } from 'src/types/page-assessment';

export const buildPageRecordData = (
  seoAuditId: string,
  page: CrawledPage,
  assessment: PageAssessment | undefined,
) => ({
  seoAuditId,
  url: page.url,
  statusCode: page.statusCode,
  responseTimeMs: page.responseTimeMs,
  title: page.title,
  wordCount: page.wordCount,
  pageType: assessment?.pageType ?? null,
  searchIntent: assessment?.searchIntent ?? null,
  helpfulness: assessment?.helpfulness ?? null,
  specificity: assessment?.specificity ?? null,
  trust: assessment?.trust ?? null,
  confidence: assessment?.confidence ?? null,
  needsReview: assessment?.needsReview ?? false,
});
