import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  AGENT_ROLE,
  AGENT_TASK_STATUS,
} from 'src/constants/agency-ops.constants';

type OpportunityRecord = {
  name?: string | null;
  companyId?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<OpportunityRecord>>,
): Promise<void> => {
  const data = batch.events.map((event) => {
    const opportunityName = event.properties.after.name ?? 'Unnamed lead';

    return {
      name: `Qualify lead: ${opportunityName}`,
      agentRole: AGENT_ROLE.LEAD_SALES,
      status: AGENT_TASK_STATUS.QUEUED,
      priority: 'HIGH' as const,
      brief:
        'New inbound lead. Research the company, judge fit, and draft a first reply. Raise an approval before any first contact is sent.',
      opportunityId: event.recordId,
      companyId: event.properties.after.companyId ?? undefined,
    };
  });

  if (data.length === 0) {
    return;
  }

  const client = new CoreApiClient();

  await client.mutation({
    createAgentTasks: { __args: { data }, id: true },
  });
};

export default defineLogicFunction({
  universalIdentifier: '739a1bf7-a26f-4269-bd61-fc2c5aaae4d7',
  name: 'create-lead-task-on-opportunity-created',
  description:
    'Queues a lead qualification task for the lead agent when an opportunity is created.',
  timeoutSeconds: 30,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.created',
    batchMode: true,
  },
  handler,
});
