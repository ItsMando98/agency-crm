import type Anthropic from '@anthropic-ai/sdk';

import { requestStructuredJson } from 'src/anthropic-client/request-structured-json';
import { CLASSIFIER_CONCURRENCY } from 'src/constants/classifier.const';
import {
  KEYWORD_ASSESSMENT_JSON_SCHEMA,
  KEYWORD_ASSESSMENT_MAX_TOKENS,
  KEYWORD_ASSESSMENT_SYSTEM_PROMPT,
} from 'src/constants/keyword-classifier.const';
import { KEYWORD_BATCH_SIZE } from 'src/constants/seo-thresholds.const';
import { type KeywordAssessment } from 'src/types/keyword-assessment';
import { type KeywordSiteContext } from 'src/types/keyword-site-context';
import { buildKeywordClassifierInput } from 'src/utils/build-keyword-classifier-input.util';
import { chunkArray } from 'src/utils/chunk-array.util';
import { parseKeywordAssessments } from 'src/utils/parse-keyword-assessments.util';
import { runWithConcurrency } from 'src/utils/run-with-concurrency.util';

type AssessKeywordsParams = {
  client: Anthropic;
  keywords: string[];
  context: KeywordSiteContext;
};

export const assessKeywords = async ({
  client,
  keywords,
  context,
}: AssessKeywordsParams): Promise<KeywordAssessment[]> => {
  const batches = chunkArray(keywords, KEYWORD_BATCH_SIZE);

  const results = await runWithConcurrency(
    batches,
    CLASSIFIER_CONCURRENCY,
    async (batch) =>
      parseKeywordAssessments(
        await requestStructuredJson({
          client,
          system: KEYWORD_ASSESSMENT_SYSTEM_PROMPT,
          userContent: buildKeywordClassifierInput(context, batch),
          schema: KEYWORD_ASSESSMENT_JSON_SCHEMA,
          maxTokens: KEYWORD_ASSESSMENT_MAX_TOKENS,
        }),
        batch,
      ),
  );

  return results.flat();
};
