import {
  AI_CRAWLERS,
  AI_READINESS_WEIGHTS,
} from 'src/constants/ai-readiness.const';
import { type AiReadiness } from 'src/types/ai-readiness';

export const computeAiReadinessScore = (aiReadiness: AiReadiness): number => {
  const allowedCrawlerShare =
    AI_CRAWLERS.filter(({ id }) => aiReadiness.crawlerAccess[id] === 'ALLOWED')
      .length / AI_CRAWLERS.length;

  return Math.round(
    allowedCrawlerShare * AI_READINESS_WEIGHTS.CRAWLER_ACCESS +
      (aiReadiness.organizationSchemaFound
        ? AI_READINESS_WEIGHTS.ORGANIZATION_SCHEMA
        : 0) +
      (aiReadiness.llmsTxtFound ? AI_READINESS_WEIGHTS.LLMS_TXT : 0) +
      (aiReadiness.faqSchemaFound ? AI_READINESS_WEIGHTS.FAQ_SCHEMA : 0),
  );
};
