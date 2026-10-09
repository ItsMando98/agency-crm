import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PRIORITY_RANK } from 'src/constants/seo-ranks.const';
import { KEYWORD_CATEGORY, SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { getSeoAuditInputSchema } from 'src/logic-functions/schemas/get-seo-audit-input.schema';
import { type GetSeoAuditInput } from 'src/types/get-seo-audit-input';
import { type SeoPriority } from 'src/types/seo-priority';

const MAX_TASKS_RETURNED = 15;
const MAX_KEYWORDS_RETURNED = 10;
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
  keywordOpportunities?: unknown[];
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
          organicKeywordCount: true,
          estimatedMonthlyTraffic: true,
          backlinkCount: true,
          referringDomainCount: true,
          mobilePerformanceScore: true,
          mobileLcpMs: true,
          mobileCls: true,
          mobileTbtMs: true,
          aiPresenceRate: true,
          aiQueriesTested: true,
          aiVisibility: true,
          competitors: true,
          marketDataNotes: true,
          reportUrl: true,
          exportNotes: true,
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

  const { seoKeywordOpportunities } = await client.query({
    seoKeywordOpportunities: {
      __args: {
        filter: {
          seoAuditId: { eq: parameters.auditId },
          category: { in: [KEYWORD_CATEGORY.QUICK_WIN, KEYWORD_CATEGORY.NEAR_PAGE_ONE] },
        },
        orderBy: [{ searchVolume: 'DescNullsLast' }],
        first: MAX_KEYWORDS_RETURNED,
      },
      edges: {
        node: {
          keyword: true,
          rankPosition: true,
          searchVolume: true,
          url: true,
          category: true,
        },
      },
    },
  });

  return {
    success: true,
    message: 'Audit finished',
    audit,
    topTasks,
    keywordOpportunities: (seoKeywordOpportunities?.edges ?? []).map(
      (edge: { node: unknown }) => edge.node,
    ),
    reportMarkdown: parameters.includeReport === false ? undefined : reportMarkdown,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'a19305ed-7eca-47bb-bfe8-9140b1c7f987',
  name: 'get_seo_audit',
  description:
    'Reads an SEO audit by its auditId. While the audit is queued or running it returns the status. When finished it returns the score, grade, area scores, market data (ranking keywords, estimated traffic, backlinks, competitors) and the mobile speed of the homepage (Lighthouse: performance score, LCP, CLS, TBT) when DataForSEO is configured, the AI answers (per customer question whether ChatGPT, Perplexity and Gemini cited or mentioned the website, and who they named instead, with aiPresenceRate) when the optional AI visibility check ran, the reportUrl of the shareable HTML report (open it and choose Save as PDF; the Excel and PDF files are attached to the audit record), the most important tasks, the best keyword opportunities and the full Markdown report with the prioritized action list.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: getSeoAuditInputSchema,
  },
  handler,
});
