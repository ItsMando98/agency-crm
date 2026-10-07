import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { type SeoAuditRecord } from 'src/types/seo-audit-record';
import { isBlankAuditDomain } from 'src/utils/is-blank-audit-domain.util';

const domainText = (domain: string | null | undefined): string =>
  (domain ?? '').trim();

// The audit writes status itself. Those saves must not start another run.
export const shouldRunAuditOnUpdate = (
  before: SeoAuditRecord | null | undefined,
  after: SeoAuditRecord | null | undefined,
): boolean => {
  if (after === null || after === undefined) {
    return false;
  }

  if (
    after.status === SEO_AUDIT_STATUS.RUNNING ||
    after.status === SEO_AUDIT_STATUS.DONE
  ) {
    return false;
  }

  const domainChanged = domainText(before?.domain) !== domainText(after.domain);
  const askedToRun =
    after.status === SEO_AUDIT_STATUS.QUEUED &&
    before?.status !== SEO_AUDIT_STATUS.QUEUED;

  if (!domainChanged && !askedToRun) {
    return false;
  }

  return !isBlankAuditDomain(after.domain);
};
