import { AI_ENGINES } from 'src/constants/ai-visibility.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AiAnswerStatus, type AiVisibility } from 'src/types/ai-visibility';
import { type AuditLanguage } from 'src/types/audit-language';

type AiVisibilityTable = {
  header: string[];
  rows: string[][];
};

const NO_DOMAIN = '-';

export const buildAiVisibilityTable = (
  aiVisibility: AiVisibility,
  language: AuditLanguage,
): AiVisibilityTable => {
  const labels = REPORT_LABELS[language];
  const statusLabels: Record<AiAnswerStatus, string> = {
    CITED: labels.statusCited,
    MENTIONED: labels.statusMentioned,
    ABSENT: labels.statusAbsent,
    UNKNOWN: labels.statusUnknown,
  };

  return {
    header: [
      labels.questionColumn,
      ...AI_ENGINES.map(({ label }) => label),
      labels.namedInsteadColumn,
    ],
    rows: aiVisibility.rows.map((row) => [
      row.query,
      ...AI_ENGINES.map(({ id }) => statusLabels[row.results[id]]),
      row.instead.length === 0 ? NO_DOMAIN : row.instead.join(', '),
    ]),
  };
};
