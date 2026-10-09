import { type AI_CRAWLERS } from 'src/constants/ai-readiness.const';

export type AiCrawlerId = (typeof AI_CRAWLERS)[number]['id'];

export type AiCrawlerAccessStatus = 'ALLOWED' | 'BLOCKED';

export type AiReadiness = {
  crawlerAccess: Record<AiCrawlerId, AiCrawlerAccessStatus>;
  llmsTxtFound: boolean;
  organizationSchemaFound: boolean;
  faqSchemaFound: boolean;
};
