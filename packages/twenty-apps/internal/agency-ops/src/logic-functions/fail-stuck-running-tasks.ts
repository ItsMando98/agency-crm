import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  AGENT_TASK_STATUS,
  RUNNING_TASK_TIMEOUT_MINUTES,
} from 'src/constants/agency-ops.constants';

const MILLISECONDS_PER_MINUTE = 60_000;

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();
  const cutoff = new Date(
    Date.now() - RUNNING_TASK_TIMEOUT_MINUTES * MILLISECONDS_PER_MINUTE,
  ).toISOString();

  const stuck = await client.query({
    agentTasks: {
      __args: {
        filter: {
          status: { eq: AGENT_TASK_STATUS.RUNNING },
          startedAt: { lt: cutoff },
        },
      },
      edges: { node: { id: true } },
    },
  });

  for (const edge of stuck.agentTasks?.edges ?? []) {
    await client.mutation({
      updateAgentTask: {
        __args: {
          id: edge.node.id,
          data: {
            status: AGENT_TASK_STATUS.FAILED,
            failureReason: `No progress for ${RUNNING_TASK_TIMEOUT_MINUTES} minutes`,
            finishedAt: new Date().toISOString(),
          },
        },
        id: true,
      },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: '4fe3979b-9964-44a9-9414-ec8a688df20e',
  name: 'fail-stuck-running-tasks',
  description:
    'Marks tasks that have been running without finishing for too long as failed.',
  timeoutSeconds: 60,
  cronTriggerSettings: { pattern: '*/15 * * * *' },
  handler,
});
