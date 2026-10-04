import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { AGENT_TASK_STATUS } from 'src/constants/agency-ops.constants';

type ApprovalRecord = {
  agentTaskId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<ApprovalRecord>>,
): Promise<void> => {
  const client = new CoreApiClient();

  for (const event of batch.events) {
    const agentTaskId = event.properties.after.agentTaskId;

    if (!agentTaskId) {
      continue;
    }

    await client.mutation({
      updateAgentTask: {
        __args: {
          id: agentTaskId,
          data: { status: AGENT_TASK_STATUS.WAITING_APPROVAL },
        },
        id: true,
      },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: '9504a75f-37e3-4499-881e-ca2e5734844c',
  name: 'pause-task-on-approval-created',
  description:
    'Marks the linked agent task as waiting for a human when an approval is raised.',
  timeoutSeconds: 30,
  databaseEventTriggerSettings: {
    eventName: 'approval.created',
    batchMode: true,
  },
  handler,
});
