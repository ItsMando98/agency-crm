import { useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { type AuditLanguage } from 'src/types/audit-language';
import { buildAuditName } from 'src/utils/build-audit-name.util';
import { normalizeAuditDomain } from 'src/utils/normalize-audit-domain.util';

type StartSeoAuditParams = {
  domain: string;
  language: AuditLanguage;
};

type StartSeoAuditResult =
  | { auditId: string; errorMessage?: undefined }
  | { auditId?: undefined; errorMessage: string };

export const useStartSeoAudit = () => {
  const [isStarting, setIsStarting] = useState(false);

  const startSeoAudit = async ({
    domain,
    language,
  }: StartSeoAuditParams): Promise<StartSeoAuditResult> => {
    let origin: string;

    try {
      origin = normalizeAuditDomain(domain);
    } catch (error) {
      return {
        errorMessage: error instanceof Error ? error.message : 'Invalid domain',
      };
    }

    setIsStarting(true);

    try {
      const client = new CoreApiClient();
      const created = await client.mutation({
        createSeoAudit: {
          __args: {
            data: {
              name: buildAuditName(origin, new Date()),
              domain: origin,
              status: SEO_AUDIT_STATUS.QUEUED,
              language,
            },
          },
          id: true,
        },
      });
      const auditId = created.createSeoAudit?.id;

      return typeof auditId === 'string'
        ? { auditId }
        : { errorMessage: 'The audit could not be created.' };
    } catch {
      return { errorMessage: 'The audit could not be created.' };
    } finally {
      setIsStarting(false);
    }
  };

  return { startSeoAudit, isStarting };
};
