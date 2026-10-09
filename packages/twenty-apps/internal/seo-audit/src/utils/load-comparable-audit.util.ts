import { type CoreApiClient } from 'twenty-client-sdk/core';

import { MAX_FETCHED_TASKS } from 'src/constants/agent-tool.const';
import { type ComparableAudit } from 'src/types/comparable-audit';
import { type SeoAuditSummary } from 'src/types/seo-audit-summary';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { mapAuditToSummary } from 'src/utils/map-audit-to-summary.util';

const AUDIT_FIELDS = {
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
  organicKeywordCount: true,
  estimatedMonthlyTraffic: true,
  backlinkCount: true,
  referringDomainCount: true,
  mobilePerformanceScore: true,
  mobileLcpMs: true,
  mobileCls: true,
  mobileTbtMs: true,
  aiPresenceRate: true,
} as const;

export type LoadedAudit = {
  summary: SeoAuditSummary;
  comparable: ComparableAudit;
};

export const loadComparableAudit = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
  orderBy?: Record<string, string>[],
): Promise<LoadedAudit | null> => {
  const { seoAudits } = await client.query({
    seoAudits: {
      __args: { filter, first: 1, ...(orderBy === undefined ? {} : { orderBy }) },
      edges: { node: AUDIT_FIELDS },
    },
  });
  const node = seoAudits?.edges?.[0]?.node as Record<string, unknown> | undefined;

  if (node === undefined) {
    return null;
  }

  const summary = mapAuditToSummary(node);
  const { seoAuditTasks } = await client.query({
    seoAuditTasks: {
      __args: { filter: { seoAuditId: { eq: summary.id } }, first: MAX_FETCHED_TASKS },
      edges: { node: { ruleId: true, name: true, priority: true } },
    },
  });

  return {
    summary,
    comparable: {
      score: summary.score,
      grade: summary.grade,
      areaScores: summary.areaScores,
      organicKeywordCount: asFiniteNumber(node.organicKeywordCount),
      estimatedMonthlyTraffic: asFiniteNumber(node.estimatedMonthlyTraffic),
      backlinkCount: asFiniteNumber(node.backlinkCount),
      referringDomainCount: asFiniteNumber(node.referringDomainCount),
      mobilePerformanceScore: asFiniteNumber(node.mobilePerformanceScore),
      mobileLcpMs: asFiniteNumber(node.mobileLcpMs),
      mobileCls: asFiniteNumber(node.mobileCls),
      mobileTbtMs: asFiniteNumber(node.mobileTbtMs),
      aiPresenceRate: asFiniteNumber(node.aiPresenceRate),
      tasks: ((seoAuditTasks?.edges ?? []) as { node: Record<string, unknown> }[]).map(({ node: task }) => ({
        ruleId: typeof task.ruleId === 'string' ? task.ruleId : null,
        name: String(task.name ?? ''),
        priority: String(task.priority ?? ''),
      })),
    },
  };
};
