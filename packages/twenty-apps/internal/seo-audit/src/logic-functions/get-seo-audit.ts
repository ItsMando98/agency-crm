import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PRIORITY_RANK } from 'src/constants/seo-ranks.const';
import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { getSeoAuditInputSchema } from 'src/logic-functions/schemas/get-seo-audit-input.schema';
import { type GetSeoAuditInput } from 'src/types/get-seo-audit-input';
import { type SeoPriority } from 'src/types/seo-priority';

const MAX_TASKS_RETURNED = 15;
const MAX_TASKS_FETCHED = 100;

type TaskNode = {
  id: string;
  name: string;
  description: string | null;
  priority: SeoPriority;
  effort: string;
  area: string;
  status: string;
};

type GetSeoAuditResult = {
  success: boolean;
  message: string;
  audit?: Record<string, unknown>;
  topTasks?: TaskNode[];
  reportMarkdown?: string | null;
  error?: string;
};

const handler = async (
  parameters: GetSeoAuditInput,
): Promise<GetSeoAuditResult> => {
  const client = new CoreApiClient();
  const { seoAudits } = await client.query({
    seoAudits: {
      __args: { filter: { id: { eq: parameters.auditId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          domain: true,
          status: true,
          score: true,
          grade: true,
          pagesCrawled: true,
          areaScores: true,
          failureReason: true,
          reportMarkdown: true,
          finishedAt: true,
        },
      },
    },
  });
  const { reportMarkdown, ...audit } = seoAudits?.edges?.[0]?.node ?? {};

  if (audit.id === undefined) {
    return {
      success: false,
      message: 'No SEO audit found with this ID',
      error: `Unknown auditId ${parameters.auditId}`,
    };
  }

  if (audit.status !== SEO_AUDIT_STATUS.DONE) {
    return {
      success: true,
      message:
        audit.status === SEO_AUDIT_STATUS.FAILED
          ? 'The audit failed, see failureReason'
          : 'The audit is not finished yet, check again shortly',
      audit,
    };
  }

  const { seoAuditTasks } = await client.query({
    seoAuditTasks: {
      __args: {
        filter: { seoAuditId: { eq: parameters.auditId } },
        first: MAX_TASKS_FETCHED,
      },
      edges: {
        node: {
          id: true,
          name: true,
          description: true,
          priority: true,
          effort: true,
          area: true,
          status: true,
        },
      },
    },
  });
  const topTasks = ((seoAuditTasks?.edges ?? []) as { node: TaskNode }[])
    .map((edge) => edge.node)
    .sort(
      (first, second) =>
        PRIORITY_RANK[first.priority] - PRIORITY_RANK[second.priority],
    )
    .slice(0, MAX_TASKS_RETURNED);

  return {
    success: true,
    message: 'Audit finished',
    audit,
    topTasks,
    reportMarkdown,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'a19305ed-7eca-47bb-bfe8-9140b1c7f987',
  name: 'get_seo_audit',
  description:
    'Reads an SEO audit by its auditId. While the audit is queued or running it returns the status. When finished it returns the score, grade, area scores, the most important tasks and the full Markdown report with the prioritized action list.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: getSeoAuditInputSchema,
  },
  handler,
});
