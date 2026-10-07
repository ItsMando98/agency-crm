import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  SEO_AUDIT_STATUS,
  STUCK_AUDIT_TIMEOUT_MINUTES,
} from 'src/constants/seo-audit.constants';
import { isBlankAuditDomain } from 'src/utils/is-blank-audit-domain.util';

const MILLISECONDS_PER_MINUTE = 60_000;

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();
  const cutoff = new Date(
    Date.now() - STUCK_AUDIT_TIMEOUT_MINUTES * MILLISECONDS_PER_MINUTE,
  ).toISOString();

  const stuck = await client.query({
    seoAudits: {
      __args: {
        filter: {
          status: { in: [SEO_AUDIT_STATUS.RUNNING, SEO_AUDIT_STATUS.QUEUED] },
          createdAt: { lt: cutoff },
        },
      },
      edges: {
        node: {
          id: true,
          domain: true,
          status: true,
          startedAt: true,
          createdAt: true,
        },
      },
    },
  });

  for (const edge of stuck.seoAudits?.edges ?? []) {
    const record = edge.node;

    // A row with no website is a draft, not a stuck run.
    if (isBlankAuditDomain(record.domain)) {
      continue;
    }

    // A retry writes a new startedAt. createdAt stays the original day.
    const referenceTime =
      record.status === SEO_AUDIT_STATUS.RUNNING
        ? record.startedAt
        : record.createdAt;

    if (typeof referenceTime !== 'string' || referenceTime >= cutoff) {
      continue;
    }

    await client.mutation({
      updateSeoAudit: {
        __args: {
          id: edge.node.id,
          data: {
            status: SEO_AUDIT_STATUS.FAILED,
            failureReason: `No result after ${STUCK_AUDIT_TIMEOUT_MINUTES} minutes`,
            finishedAt: new Date().toISOString(),
          },
        },
        id: true,
      },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: '7b17eecc-6d22-42f0-b163-c7cc0f1c0a0d',
  name: 'fail-stuck-seo-audits',
  description:
    'Marks queued audits that never started, and running audits that never finished, as failed. A record with no website is left alone.',
  timeoutSeconds: 60,
  cronTriggerSettings: { pattern: '*/15 * * * *' },
  handler,
});
