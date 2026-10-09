import { type AuditLanguage } from 'src/types/audit-language';

type AiReadinessDetailLabels = {
  blockedCrawlers: (crawlerNames: string) => string;
};

export const AI_READINESS_DETAIL_LABELS: Record<
  AuditLanguage,
  AiReadinessDetailLabels
> = {
  DE: { blockedCrawlers: (crawlerNames) => `Gesperrt: ${crawlerNames}` },
  EN: { blockedCrawlers: (crawlerNames) => `Blocked: ${crawlerNames}` },
};
