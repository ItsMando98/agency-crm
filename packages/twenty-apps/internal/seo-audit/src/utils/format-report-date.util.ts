import { type AuditLanguage } from 'src/types/audit-language';

export const formatReportDate = (isoDate: string, language: AuditLanguage): string => {
  const [year, month, day] = isoDate.slice(0, 10).split('-');

  return language === 'DE' ? `${day}.${month}.${year}` : `${year}-${month}-${day}`;
};
