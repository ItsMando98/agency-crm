import { type AuditLanguage } from 'src/types/audit-language';

export const formatDecimal = (
  value: number,
  language: AuditLanguage,
  fractionDigits: number,
): string =>
  new Intl.NumberFormat(language === 'DE' ? 'de-DE' : 'en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
