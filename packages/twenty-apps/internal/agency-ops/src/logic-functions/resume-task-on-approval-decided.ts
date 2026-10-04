import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  AGENT_TASK_STATUS,
  APPROVAL_STATUS,
} from 'src/constants/agency-ops.constants';

type ApprovalRecord = {
  status?: string | null;
  decisionNote?: string | null;
  decidedAt?: string | null;
  agentTaskId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<ApprovalRecord>>,
): Promise<void> => {
  const client = new CoreApiClient();

  for (const event of batch.events) {
    const approval = event.properties.after;
    const isDecided =
      approval.status === APPROVAL_STATUS.APPROVED ||
      approval.status === APPROVAL_STATUS.REJECTED;

    // The decidedAt write below fires this trigger again; the guard ends that loop.
    if (!isDecided || approval.decidedAt) {
      continue;
    }

    await client.mutation({
      updateApproval: {
        __args: {
          id: event.recordId,
          data: { decidedAt: new Date().toISOString() },
        },
        id: true,
      },
    });

    if (!approval.agentTaskId) {
      continue;
    }

    if (approval.status === APPROVAL_STATUS.REJECTED) {
      await client.mutation({
        updateAgentTask: {
          __args: {
            id: approval.agentTaskId,
            data: {
              status: AGENT_TASK_STATUS.CANCELLED,
              failureReason: `Rejected by a human. ${approval.decisionNote ?? ''}`.trim(),
              finishedAt: new Date().toISOString(),
            },
          },
          id: true,
        },
      });
      continue;
    }

    const stillPending = await client.query({
      approvals: {
        __args: {
          filter: {
            agentTaskId: { eq: approval.agentTaskId },
            status: { eq: APPROVAL_STATUS.PENDING },
          },
        },
        edges: { node: { id: true } },
      },
    });

    if (stillPending.approvals?.edges?.length) {
      continue;
    }

    await client.mutation({
      updateAgentTask: {
        __args: {
          id: approval.agentTaskId,
          data: { status: AGENT_TASK_STATUS.QUEUED },
        },
        id: true,
      },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: 'c71c68b4-1a21-48ec-bb08-85b7f534a0f8',
  name: 'resume-task-on-approval-decided',
  description:
    'Requeues the agent task once all its approvals are approved, cancels it when one is rejected.',
  timeoutSeconds: 30,
  databaseEventTriggerSettings: {
    eventName: 'approval.updated',
    batchMode: true,
  },
  handler,
});
