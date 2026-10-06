import { type AuditLanguage } from 'src/types/audit-language';

export const formatNumber = (value: number, language: AuditLanguage): string =>
  new Intl.NumberFormat(language === 'DE' ? 'de-DE' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(value);
