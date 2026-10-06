import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { compareSeoAuditsInputSchema } from 'src/logic-functions/schemas/compare-seo-audits-input.schema';
import { computeAuditComparison } from 'src/utils/compute-audit-comparison.util';
import { loadComparableAudit } from 'src/utils/load-comparable-audit.util';

type CompareSeoAuditsInput = {
  auditId: string;
  previousAuditId?: string;
};

const handler = async (parameters: CompareSeoAuditsInput) => {
  const client = new CoreApiClient();
  const current = await loadComparableAudit(client, { id: { eq: parameters.auditId } });

  if (current === null) {
    return { success: false, message: 'No SEO audit found with this ID', error: `Unknown auditId ${parameters.auditId}` };
  }

  if (current.summary.status !== SEO_AUDIT_STATUS.DONE) {
    return { success: false, message: 'The audit is not finished yet', error: `Status is ${current.summary.status}` };
  }

  const previous =
    parameters.previousAuditId !== undefined
      ? await loadComparableAudit(client, { id: { eq: parameters.previousAuditId } })
      : current.summary.domain === null || current.summary.createdAt === null
        ? null
        : await loadComparableAudit(
            client,
            {
              domain: { eq: current.summary.domain },
              status: { eq: SEO_AUDIT_STATUS.DONE },
              createdAt: { lt: current.summary.createdAt },
            },
            [{ createdAt: 'DescNullsLast' }],
          );

  if (previous === null) {
    return {
      success: false,
      message: 'There is no earlier finished audit of this website to compare with',
      error: 'No previous audit',
    };
  }

  return {
    success: true,
    message: 'Compared with the earlier audit. Positive deltas are improvements for scores.',
    current: current.summary,
    previous: previous.summary,
    comparison: computeAuditComparison(previous.comparable, current.comparable),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'ae6c0ca7-0e3f-4aef-bfa3-84710922eff7',
  name: 'compare_seo_audits',
  description:
    'Compares an SEO audit with the earlier finished audit of the same website: score and grade change, change per area, market metrics (ranking keywords, traffic, backlinks), tasks that are resolved and tasks that are new. Use it to show a client progress or to check whether fixes worked.',
  timeoutSeconds: 30,
  toolTriggerSettings: { inputSchema: compareSeoAuditsInputSchema },
  handler,
});
