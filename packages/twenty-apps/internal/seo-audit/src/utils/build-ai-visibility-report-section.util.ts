import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type AuditLanguage } from 'src/types/audit-language';
import { buildAiVisibilityTable } from 'src/utils/build-ai-visibility-table.util';

type BuildAiVisibilityReportSectionParams = {
  aiVisibility: AiVisibility;
  language: AuditLanguage;
};

const PERCENT = 100;
const DATE_LENGTH = 10;

const escapeCell = (value: string): string => value.replace(/\|/g, '\\|');

export const buildAiVisibilityReportSection = ({
  aiVisibility,
  language,
}: BuildAiVisibilityReportSectionParams): string[] => {
  const labels = REPORT_LABELS[language];
  const lines: string[] = [`## ${labels.aiVisibilityHeading}`, ''];

  if (aiVisibility.rows.length > 0) {
    const { header, rows } = buildAiVisibilityTable(aiVisibility, language);

    lines.push(labels.aiVisibilityIntro, '');

    if (aiVisibility.presenceRate !== null) {
      lines.push(
        `${labels.aiVisibilityPresence}: ${Math.round(aiVisibility.presenceRate * PERCENT)} %`,
        `${labels.aiVisibilityTestedOn} ${aiVisibility.testedAt.slice(0, DATE_LENGTH)}`,
        '',
      );
    }

    lines.push(
      `| ${header.map(escapeCell).join(' | ')} |`,
      `| ${header.map(() => '---').join(' | ')} |`,
      ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
      '',
    );
  }

  if (aiVisibility.notes.length > 0) {
    lines.push(
      `> ${labels.marketNotes}:`,
      ...aiVisibility.notes.map((note) => `> - ${note}`),
      '',
    );
  }

  return lines;
};
