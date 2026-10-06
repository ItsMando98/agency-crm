import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { startSeoAuditInputSchema } from 'src/logic-functions/schemas/start-seo-audit-input.schema';
import { type StartSeoAuditInput } from 'src/types/start-seo-audit-input';
import { buildAuditName } from 'src/utils/build-audit-name.util';
import { normalizeAuditDomain } from 'src/utils/normalize-audit-domain.util';
import { readAuditSettings } from 'src/utils/read-audit-settings.util';

type StartSeoAuditResult = {
  success: boolean;
  message: string;
  auditId?: string;
  status?: string;
  error?: string;
};

const handler = async (
  parameters: StartSeoAuditInput,
): Promise<StartSeoAuditResult> => {
  let origin: string;

  try {
    origin = normalizeAuditDomain(parameters.domain);
  } catch (error) {
    return {
      success: false,
      message: 'The domain cannot be audited',
      error: error instanceof Error ? error.message : 'Invalid domain',
    };
  }

  const client = new CoreApiClient();
  const created = await client.mutation({
    createSeoAudit: {
      __args: {
        data: {
          name: buildAuditName(origin, new Date()),
          domain: origin,
          status: SEO_AUDIT_STATUS.QUEUED,
          language: parameters.language ?? readAuditSettings().defaultLanguage,
          companyId: parameters.companyId,
        },
      },
      id: true,
    },
  });

  return {
    success: true,
    message:
      'Audit queued. It usually finishes within a few minutes. Poll get_seo_audit with the auditId until the status is DONE or FAILED.',
    auditId: created.createSeoAudit?.id,
    status: SEO_AUDIT_STATUS.QUEUED,
  };
};

export default defineLogicFunction({
  universalIdentifier: '0e6a2645-d1ac-427d-92d4-c85d1fce80b1',
  name: 'start_seo_audit',
  description:
    'Starts an SEO audit for a website. The audit crawls up to 60 pages, measures technical rules, lets a classifier judge page quality and produces a score, an action list and a Markdown report. Returns immediately with an auditId. Call get_seo_audit afterwards to read the result.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: startSeoAuditInputSchema,
  },
  handler,
});
