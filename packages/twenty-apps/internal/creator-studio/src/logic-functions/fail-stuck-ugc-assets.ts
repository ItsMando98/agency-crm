import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { ASSET_STATUS, STUCK_ASSET_TIMEOUT_MINUTES } from 'src/constants/creator-studio.const';

const MILLISECONDS_PER_MINUTE = 60_000;

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();
  const cutoff = new Date(Date.now() - STUCK_ASSET_TIMEOUT_MINUTES * MILLISECONDS_PER_MINUTE).toISOString();
  const stuck = await client.query({
    ugcAssets: {
      __args: {
        filter: {
          status: { in: [ASSET_STATUS.QUEUED, ASSET_STATUS.RUNNING] },
          createdAt: { lt: cutoff },
        },
      },
      edges: { node: { id: true } },
    },
  });

  for (const edge of stuck.ugcAssets?.edges ?? []) {
    await client.mutation({
      updateUgcAsset: {
        __args: {
          id: edge.node.id,
          data: {
            status: ASSET_STATUS.FAILED,
            failureReason: `No result after ${STUCK_ASSET_TIMEOUT_MINUTES} minutes`,
            finishedAt: new Date().toISOString(),
          },
        },
        id: true,
      },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: '5a8e4bcc-3d51-4e31-a5c1-2f7a64d2b7c9',
  name: 'fail-stuck-ugc-assets',
  description: 'Marks assets that stayed queued or running for too long as failed.',
  timeoutSeconds: 60,
  cronTriggerSettings: { pattern: '*/15 * * * *' },
  handler,
});
