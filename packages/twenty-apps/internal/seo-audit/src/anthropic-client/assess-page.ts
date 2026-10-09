import type Anthropic from '@anthropic-ai/sdk';

import { PAGE_ASSESSMENT_JSON_SCHEMA } from 'src/constants/classifier-schemas.const';
import { PAGE_ASSESSMENT_SYSTEM_PROMPT } from 'src/constants/classifier-system-prompts.const';
import { PAGE_ASSESSMENT_MAX_TOKENS } from 'src/constants/classifier.const';
import { requestStructuredJson } from 'src/anthropic-client/request-structured-json';
import { type CrawledPage } from 'src/types/crawled-page';
import { type PageAssessment } from 'src/types/page-assessment';
import { buildPageClassifierInput } from 'src/utils/build-page-classifier-input.util';
import { parsePageAssessment } from 'src/utils/parse-page-assessment.util';

type AssessPageParams = {
  client: Anthropic;
  page: CrawledPage;
  onError?: (message: string) => void;
};

export const assessPage = async ({
  client,
  page,
  onError,
}: AssessPageParams): Promise<PageAssessment | null> =>
  parsePageAssessment(
    page.url,
    await requestStructuredJson({
      client,
      system: PAGE_ASSESSMENT_SYSTEM_PROMPT,
      userContent: buildPageClassifierInput(page),
      schema: PAGE_ASSESSMENT_JSON_SCHEMA,
      maxTokens: PAGE_ASSESSMENT_MAX_TOKENS,
      onError,
    }),
  );
