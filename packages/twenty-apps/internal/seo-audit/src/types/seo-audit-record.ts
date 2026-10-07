import { type AuditLanguage } from 'src/types/audit-language';

export type SeoAuditRecord = {
  name?: string | null;
  domain?: string | null;
  status?: string | null;
  language?: AuditLanguage | null;
};
