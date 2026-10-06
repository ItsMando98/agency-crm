import { type AuditLanguage } from 'src/types/audit-language';

export type StartSeoAuditInput = {
  domain: string;
  companyId?: string;
  language?: AuditLanguage;
};
