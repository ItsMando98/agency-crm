import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  DEFAULT_LIST_LIMIT,
  MAX_LIST_LIMIT,
} from 'src/constants/agent-tool.const';
import { listSeoAuditsInputSchema } from 'src/logic-functions/schemas/list-seo-audits-input.schema';
import { buildDomainFilterPattern } from 'src/utils/build-domain-filter-pattern.util';
import { clampLimit } from 'src/utils/clamp-limit.util';
import { mapAuditToSummary } from 'src/utils/map-audit-to-summary.util';

type ListSeoAuditsInput = {
  companyId?: string;
  domain?: string;
  status?: string;
  limit?: number;
};

const handler = async (parameters: ListSeoAuditsInput) => {
  const client = new CoreApiClient();
  const filter: Record<string, unknown> = {};

  if (parameters.companyId !== undefined) {
    filter.companyId = { eq: parameters.companyId };
  }

  if (parameters.domain !== undefined && parameters.domain.trim() !== '') {
    filter.domain = { ilike: buildDomainFilterPattern(parameters.domain) };
  }

  if (parameters.status !== undefined) {
    filter.status = { eq: parameters.status };
  }

  const { seoAudits } = await client.query({
    seoAudits: {
      __args: {
        filter,
        orderBy: [{ createdAt: 'DescNullsLast' }],
        first: clampLimit(parameters.limit, DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT),
      },
      edges: {
        node: {
          id: true,
          name: true,
          domain: true,
          status: true,
          score: true,
          grade: true,
          areaScores: true,
          pagesCrawled: true,
          reportUrl: true,
          companyId: true,
          createdAt: true,
          finishedAt: true,
        },
      },
    },
  });
  const audits = ((seoAudits?.edges ?? []) as { node: Record<string, unknown> }[]).map(
    ({ node }) => mapAuditToSummary(node),
  );

  return {
    success: true,
    message: audits.length === 0 ? 'No audits found' : `Found ${audits.length} audits, newest first`,
    audits,
  };
};

export default defineLogicFunction({
  universalIdentifier: '27d7d181-49c2-4672-9f88-3186fdd74750',
  name: 'list_seo_audits',
  description:
    'Lists SEO audits, newest first, with score, grade, area scores, status and the report link. Filter by company, website or status. Use it to find an existing audit before starting a new one, and to see how a website developed over time.',
  timeoutSeconds: 30,
  toolTriggerSettings: { inputSchema: listSeoAuditsInputSchema },
  handler,
});
