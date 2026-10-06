import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECENT_AUDIT_WINDOW_MINUTES } from 'src/constants/agent-tool.const';
import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { startSeoAuditInputSchema } from 'src/logic-functions/schemas/start-seo-audit-input.schema';
import { type StartSeoAuditInput } from 'src/types/start-seo-audit-input';
import { asRecord } from 'src/utils/as-record.util';
import { buildAuditName } from 'src/utils/build-audit-name.util';
import { extractCompanyDomain } from 'src/utils/extract-company-domain.util';
import { normalizeAuditDomain } from 'src/utils/normalize-audit-domain.util';
import { readAuditSettings } from 'src/utils/read-audit-settings.util';

const MILLISECONDS_PER_MINUTE = 60_000;

type StartSeoAuditResult = {
  success: boolean;
  message: string;
  auditId?: string;
  status?: string;
  alreadyRunning?: boolean;
  error?: string;
};

const failure = (message: string, error: string): StartSeoAuditResult => ({
  success: false,
  message,
  error,
});

const handler = async (
  parameters: StartSeoAuditInput,
): Promise<StartSeoAuditResult> => {
  const client = new CoreApiClient();
  let domain = parameters.domain?.trim();

  if ((domain === undefined || domain === '') && parameters.companyId === undefined) {
    return failure('Nothing to audit', 'Provide a domain or a companyId.');
  }

  if (domain === undefined || domain === '') {
    const { companies } = await client.query({
      companies: {
        __args: { filter: { id: { eq: parameters.companyId } }, first: 1 },
        edges: { node: { id: true, domainName: { primaryLinkUrl: true } } },
      },
    });
    const companyDomain = extractCompanyDomain(asRecord(companies?.edges?.[0])?.node);

    if (companyDomain === null) {
      return failure(
        'The company has no website',
        'The company record has no domain. Provide the domain explicitly.',
      );
    }

    domain = companyDomain;
  }

  let origin: string;

  try {
    origin = normalizeAuditDomain(domain);
  } catch (error) {
    return failure(
      'The domain cannot be audited',
      error instanceof Error ? error.message : 'Invalid domain',
    );
  }

  const cutoff = new Date(
    Date.now() - RECENT_AUDIT_WINDOW_MINUTES * MILLISECONDS_PER_MINUTE,
  ).toISOString();
  const { seoAudits: running } = await client.query({
    seoAudits: {
      __args: {
        filter: {
          domain: { eq: origin },
          status: { in: [SEO_AUDIT_STATUS.QUEUED, SEO_AUDIT_STATUS.RUNNING] },
          createdAt: { gte: cutoff },
        },
        first: 1,
      },
      edges: { node: { id: true, status: true } },
    },
  });
  const runningAudit = running?.edges?.[0]?.node;

  if (runningAudit?.id !== undefined) {
    return {
      success: true,
      message:
        'An audit for this website is already queued or running. Use its auditId instead of starting another one.',
      auditId: runningAudit.id,
      status: runningAudit.status,
      alreadyRunning: true,
    };
  }

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
    alreadyRunning: false,
  };
};

export default defineLogicFunction({
  universalIdentifier: '0e6a2645-d1ac-427d-92d4-c85d1fce80b1',
  name: 'start_seo_audit',
  description:
    'Starts an SEO audit for a website, given a domain or a company record. The audit crawls up to 60 pages, measures technical rules, lets a classifier judge page quality and, when DataForSEO is configured, adds rankings, keyword opportunities and backlinks. It costs money, so check list_seo_audits for a recent audit first. If an audit for the same website is already queued or running, its id is returned instead of starting a second one. Returns immediately with an auditId. Call get_seo_audit afterwards to read the result.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: startSeoAuditInputSchema,
  },
  handler,
});
