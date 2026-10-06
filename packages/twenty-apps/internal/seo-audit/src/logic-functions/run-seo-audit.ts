import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { type AuditLanguage } from 'src/types/audit-language';
import { buildAuditName } from 'src/utils/build-audit-name.util';
import { getAnthropicClient } from 'src/utils/get-anthropic-client.util';
import { normalizeAuditDomain } from 'src/utils/normalize-audit-domain.util';
import { persistSeoAuditResult } from 'src/utils/persist-seo-audit-result.util';
import { readAuditSettings } from 'src/utils/read-audit-settings.util';
import { runSeoAuditPipeline } from 'src/utils/run-seo-audit-pipeline.util';

type SeoAuditRecord = {
  name?: string | null;
  domain?: string | null;
  status?: string | null;
  language?: AuditLanguage | null;
};

const MAX_FAILURE_REASON_LENGTH = 500;

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<SeoAuditRecord>>,
): Promise<void> => {
  const client = new CoreApiClient();
  const anthropicClient = getAnthropicClient();
  const { defaultLanguage, maxPages } = readAuditSettings();

  for (const event of batch.events) {
    const audit = event.properties.after;
    const auditId = event.recordId;

    if (
      typeof audit.status === 'string' &&
      audit.status !== SEO_AUDIT_STATUS.QUEUED
    ) {
      continue;
    }

    const startedAt = new Date();

    await client.mutation({
      updateSeoAudit: {
        __args: {
          id: auditId,
          data: {
            status: SEO_AUDIT_STATUS.RUNNING,
            startedAt: startedAt.toISOString(),
          },
        },
        id: true,
      },
    });

    try {
      const origin = normalizeAuditDomain(audit.domain ?? '');
      const result = await runSeoAuditPipeline({
        domain: origin,
        language: audit.language ?? defaultLanguage,
        anthropicClient,
        maxPages,
      });

      await persistSeoAuditResult({
        client,
        auditId,
        result,
        finishedAt: new Date(),
      });

      if (!audit.name) {
        await client.mutation({
          updateSeoAudit: {
            __args: {
              id: auditId,
              data: { name: buildAuditName(origin, startedAt) },
            },
            id: true,
          },
        });
      }
    } catch (error) {
      await client.mutation({
        updateSeoAudit: {
          __args: {
            id: auditId,
            data: {
              status: SEO_AUDIT_STATUS.FAILED,
              failureReason: (
                error instanceof Error ? error.message : 'Audit failed'
              ).slice(0, MAX_FAILURE_REASON_LENGTH),
              finishedAt: new Date().toISOString(),
            },
          },
          id: true,
        },
      });
    }
  }
};

export default defineLogicFunction({
  universalIdentifier: '389e7901-3623-4801-b0ad-bab96f660fc6',
  name: 'run-seo-audit',
  description:
    'Runs the SEO audit for newly created audit records: crawls the site, applies the rules, classifies the pages and stores score, tasks and report.',
  timeoutSeconds: 600,
  databaseEventTriggerSettings: {
    eventName: 'seoAudit.created',
    batchMode: true,
  },
  handler,
});
