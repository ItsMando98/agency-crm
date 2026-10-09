import {
  FAQ_TYPE_PATTERN,
  LOCAL_BUSINESS_TYPE_PATTERN,
  ORGANIZATION_TYPE_PATTERN,
} from 'src/constants/structured-data-types.const';
import { type AiReadiness } from 'src/types/ai-readiness';
import { type CrawlResult } from 'src/types/crawl-result';
import { evaluateAiCrawlerAccess } from 'src/utils/evaluate-ai-crawler-access.util';

export const evaluateAiReadiness = (crawlResult: CrawlResult): AiReadiness => {
  const [homepage] = crawlResult.pages;

  return {
    crawlerAccess: evaluateAiCrawlerAccess(crawlResult.robotsTxt),
    llmsTxtFound: crawlResult.llmsTxtFound,
    organizationSchemaFound: homepage.structuredDataTypes.some(
      (type) =>
        ORGANIZATION_TYPE_PATTERN.test(type) ||
        LOCAL_BUSINESS_TYPE_PATTERN.test(type),
    ),
    faqSchemaFound: crawlResult.pages.some((page) =>
      page.structuredDataTypes.some((type) => FAQ_TYPE_PATTERN.test(type)),
    ),
  };
};
