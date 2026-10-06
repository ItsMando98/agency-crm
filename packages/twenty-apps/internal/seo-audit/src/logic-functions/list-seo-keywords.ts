import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  DEFAULT_KEYWORD_LIMIT,
  MAX_KEYWORD_LIMIT,
} from 'src/constants/agent-tool.const';
import { listSeoKeywordsInputSchema } from 'src/logic-functions/schemas/list-seo-keywords-input.schema';
import { clampLimit } from 'src/utils/clamp-limit.util';

type ListSeoKeywordsInput = {
  auditId: string;
  category?: string;
  minSearchVolume?: number;
  limit?: number;
};

const handler = async (parameters: ListSeoKeywordsInput) => {
  const client = new CoreApiClient();
  const filter: Record<string, unknown> = { seoAuditId: { eq: parameters.auditId } };

  if (parameters.category !== undefined) {
    filter.category = { eq: parameters.category };
  }

  if (parameters.minSearchVolume !== undefined) {
    filter.searchVolume = { gte: parameters.minSearchVolume };
  }

  const { seoKeywordOpportunities } = await client.query({
    seoKeywordOpportunities: {
      __args: {
        filter,
        orderBy: [{ searchVolume: 'DescNullsLast' }],
        first: clampLimit(parameters.limit, DEFAULT_KEYWORD_LIMIT, MAX_KEYWORD_LIMIT),
      },
      edges: {
        node: {
          id: true,
          keyword: true,
          rankPosition: true,
          searchVolume: true,
          estimatedTraffic: true,
          url: true,
          category: true,
          relevance: true,
          confidence: true,
          needsReview: true,
        },
      },
    },
  });
  const keywords = ((seoKeywordOpportunities?.edges ?? []) as { node: unknown }[]).map(
    ({ node }) => node,
  );

  return {
    success: true,
    message:
      keywords.length === 0
        ? 'No keywords found. Market data needs DataForSEO to be configured.'
        : `Found ${keywords.length} keywords, highest search volume first`,
    keywords,
  };
};

export default defineLogicFunction({
  universalIdentifier: '5a6a0515-1c3f-4281-8644-cbebdc4bede7',
  name: 'list_seo_keywords',
  description:
    'Lists the ranking keywords of an SEO audit with position, monthly search volume, the ranking page, a category and the relevance judged for the business. Use it to pick keywords to work on: QUICK_WIN and NEAR_PAGE_ONE are the best opportunities. Needs DataForSEO to be configured.',
  timeoutSeconds: 30,
  toolTriggerSettings: { inputSchema: listSeoKeywordsInputSchema },
  handler,
});
