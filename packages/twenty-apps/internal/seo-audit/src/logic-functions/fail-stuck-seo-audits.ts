import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  SEO_AUDIT_STATUS,
  STUCK_AUDIT_TIMEOUT_MINUTES,
} from 'src/constants/seo-audit.constants';

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
      edges: { node: { id: true } },
    },
  });

  for (const edge of stuck.seoAudits?.edges ?? []) {
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
    'Marks audits that are still queued or running long after they were created as failed.',
  timeoutSeconds: 60,
  cronTriggerSettings: { pattern: '*/15 * * * *' },
  handler,
});
