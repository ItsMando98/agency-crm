import { AI_CRAWLERS } from 'src/constants/ai-readiness.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AiReadiness } from 'src/types/ai-readiness';
import { type AuditLanguage } from 'src/types/audit-language';

type AiReadinessDisplayRow = {
  label: string;
  value: string;
  isInPlace: boolean;
};

export const buildAiReadinessDisplayRows = (
  aiReadiness: AiReadiness,
  language: AuditLanguage,
): AiReadinessDisplayRow[] => {
  const labels = REPORT_LABELS[language];
  const buildPresenceRow = (label: string, isPresent: boolean) => ({
    label,
    value: isPresent ? labels.present : labels.missing,
    isInPlace: isPresent,
  });

  return [
    ...AI_CRAWLERS.map(({ id, label }) => {
      const isAllowed = aiReadiness.crawlerAccess[id] === 'ALLOWED';

      return {
        label: `${labels.crawlerAccess}: ${label}`,
        value: isAllowed ? labels.crawlerAllowed : labels.crawlerBlocked,
        isInPlace: isAllowed,
      };
    }),
    buildPresenceRow(labels.llmsTxt, aiReadiness.llmsTxtFound),
    buildPresenceRow(labels.organizationMarkup, aiReadiness.organizationSchemaFound),
    buildPresenceRow(labels.faqMarkup, aiReadiness.faqSchemaFound),
  ];
};
