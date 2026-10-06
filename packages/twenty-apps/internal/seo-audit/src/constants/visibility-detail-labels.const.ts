import { type AuditLanguage } from 'src/types/audit-language';

type VisibilityDetailLabels = {
  keyword: (keyword: string, position: number, searchVolume: number) => string;
  backlinkTarget: (url: string, backlinks: number, referringDomains: number) => string;
};

export const VISIBILITY_DETAIL_LABELS: Record<AuditLanguage, VisibilityDetailLabels> = {
  DE: {
    keyword: (keyword, position, searchVolume) =>
      `"${keyword}": Platz ${position}, ${searchVolume} Suchen pro Monat`,
    backlinkTarget: (url, backlinks, referringDomains) =>
      `${url}: ${backlinks} Backlinks von ${referringDomains} Domains`,
  },
  EN: {
    keyword: (keyword, position, searchVolume) =>
      `"${keyword}": position ${position}, ${searchVolume} searches per month`,
    backlinkTarget: (url, backlinks, referringDomains) =>
      `${url}: ${backlinks} backlinks from ${referringDomains} domains`,
  },
};
