import type { Workbook } from 'exceljs';

import { EXCEL_LABELS } from 'src/constants/excel-labels.const';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type AuditLanguage } from 'src/types/audit-language';
import { buildAiVisibilityTable } from 'src/utils/build-ai-visibility-table.util';
import { styleHeaderRow } from 'src/utils/style-header-row.util';

const QUESTION_COLUMN_WIDTH = 60;
const STATUS_COLUMN_WIDTH = 14;
const NAMED_INSTEAD_COLUMN_WIDTH = 40;

export const addAiVisibilitySheet = (
  workbook: Workbook,
  aiVisibility: AiVisibility,
  language: AuditLanguage,
): void => {
  const sheet = workbook.addWorksheet(EXCEL_LABELS[language].sheets.aiAnswers);
  const { header, rows } = buildAiVisibilityTable(aiVisibility, language);

  sheet.columns = header.map((title, index) => ({
    header: title,
    width:
      index === 0
        ? QUESTION_COLUMN_WIDTH
        : index === header.length - 1
          ? NAMED_INSTEAD_COLUMN_WIDTH
          : STATUS_COLUMN_WIDTH,
  }));
  rows.forEach((row) => sheet.addRow(row));
  styleHeaderRow(sheet, header.length);
};
