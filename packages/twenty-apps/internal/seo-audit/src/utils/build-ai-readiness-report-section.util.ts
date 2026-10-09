import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AiReadiness } from 'src/types/ai-readiness';
import { type AuditLanguage } from 'src/types/audit-language';
import { buildAiReadinessDisplayRows } from 'src/utils/build-ai-readiness-display-rows.util';

type BuildAiReadinessReportSectionParams = {
  aiReadiness: AiReadiness;
  language: AuditLanguage;
};

export const buildAiReadinessReportSection = ({
  aiReadiness,
  language,
}: BuildAiReadinessReportSectionParams): string[] => {
  const labels = REPORT_LABELS[language];

  return [
    `## ${labels.aiReadinessHeading}`,
    '',
    labels.aiReadinessIntro,
    '',
    `| ${labels.aiReadinessCheckColumn} | ${labels.aiReadinessStatusColumn} |`,
    '| --- | --- |',
    ...buildAiReadinessDisplayRows(aiReadiness, language).map(
      (row) => `| ${row.label} | ${row.value} |`,
    ),
    '',
  ];
};
