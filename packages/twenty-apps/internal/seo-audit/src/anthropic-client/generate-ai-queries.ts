import type Anthropic from '@anthropic-ai/sdk';

import { requestStructuredJson } from 'src/anthropic-client/request-structured-json';
import {
  AI_QUERY_JSON_SCHEMA,
  AI_QUERY_SYSTEM_PROMPT,
} from 'src/constants/ai-query-generation.const';
import { QUERY_GENERATION_MAX_TOKENS } from 'src/constants/ai-visibility.const';
import { type AiQuerySiteContext } from 'src/types/ai-query-site-context';
import { type Market } from 'src/types/market';
import { buildAiQueryInput } from 'src/utils/build-ai-query-input.util';
import { parseAiQueries } from 'src/utils/parse-ai-queries.util';

type GenerateAiQueriesParams = {
  client: Anthropic;
  context: AiQuerySiteContext;
  market: Market;
  ownDomain: string;
  brandNames: string[];
};

export const generateAiQueries = async ({
  client,
  context,
  market,
  ownDomain,
  brandNames,
}: GenerateAiQueriesParams): Promise<string[]> =>
  parseAiQueries(
    await requestStructuredJson({
      client,
      system: AI_QUERY_SYSTEM_PROMPT,
      userContent: buildAiQueryInput(context, market),
      schema: AI_QUERY_JSON_SCHEMA,
      maxTokens: QUERY_GENERATION_MAX_TOKENS,
    }),
    { ownDomain, brandNames },
  );
