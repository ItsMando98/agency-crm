import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { type SeoAuditRecord } from 'src/types/seo-audit-record';
import { runQueuedSeoAudit } from 'src/utils/run-queued-seo-audit.util';
import { shouldRunAuditOnUpdate } from 'src/utils/should-run-audit-on-update.util';

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<SeoAuditRecord>>,
): Promise<void> => {
  const client = new CoreApiClient();

  for (const event of batch.events) {
    const { before, after } = event.properties;

    if (!shouldRunAuditOnUpdate(before, after) || after === undefined) {
      continue;
    }

    await runQueuedSeoAudit({
      client,
      auditId: event.recordId,
      audit: after,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: 'f3a8c2e1-7b4d-4e90-9c16-2a5d8f0b6e47',
  name: 'run-seo-audit-on-update',
  description:
    'Starts an SEO audit when a website is saved onto a queued or failed record, or when status is set back to Queued.',
  timeoutSeconds: 600,
  databaseEventTriggerSettings: {
    eventName: 'seoAudit.updated',
    updatedFields: ['domain', 'status'],
    batchMode: true,
  },
  handler,
});
