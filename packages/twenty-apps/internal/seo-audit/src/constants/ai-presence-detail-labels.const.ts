import { type AuditLanguage } from 'src/types/audit-language';

type AiPresenceDetailLabels = {
  question: (query: string, competitorDomains: string[]) => string;
  competitor: (domain: string, queryCount: number) => string;
};

export const AI_PRESENCE_DETAIL_LABELS: Record<AuditLanguage, AiPresenceDetailLabels> = {
  DE: {
    question: (query, competitorDomains) =>
      competitorDomains.length === 0
        ? `"${query}"`
        : `"${query}" (stattdessen genannt: ${competitorDomains.join(', ')})`,
    competitor: (domain, queryCount) => `${domain}: in ${queryCount} Fragen genannt`,
  },
  EN: {
    question: (query, competitorDomains) =>
      competitorDomains.length === 0
        ? `"${query}"`
        : `"${query}" (named instead: ${competitorDomains.join(', ')})`,
    competitor: (domain, queryCount) => `${domain}: named for ${queryCount} questions`,
  },
};
