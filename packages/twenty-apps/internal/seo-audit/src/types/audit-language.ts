import { type SEO_AUDIT_LANGUAGE } from 'src/constants/seo-audit.constants';

export type AuditLanguage =
  (typeof SEO_AUDIT_LANGUAGE)[keyof typeof SEO_AUDIT_LANGUAGE];
