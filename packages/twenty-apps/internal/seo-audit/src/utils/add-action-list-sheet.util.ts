import type { Workbook } from 'exceljs';

import { EXCEL_LABELS } from 'src/constants/excel-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { styleHeaderRow } from 'src/utils/style-header-row.util';

const PRIORITY_FILL: Record<string, string> = {
  CRITICAL: 'FFF8D7D7',
  HIGH: 'FFFBE3D8',
  MEDIUM: 'FFFEF1CC',
  LOW: 'FFEDEDEA',
};

export const addActionListSheet = (workbook: Workbook, result: SeoAuditResult): void => {
  const labels = EXCEL_LABELS[result.language];
  const reportLabels = REPORT_LABELS[result.language];
  const sheet = workbook.addWorksheet(labels.sheets.actions);
  const statusList = `"${labels.statuses.join(',')}"`;

  sheet.columns = [
    { header: labels.actions.number, width: 6 },
    { header: labels.actions.priority, width: 12 },
    { header: labels.actions.effort, width: 10 },
    { header: labels.actions.area, width: 20 },
    { header: labels.actions.source, width: 14 },
    { header: labels.actions.task, width: 48 },
    { header: labels.actions.recommendation, width: 70 },
    { header: labels.actions.affectedCount, width: 12 },
    { header: labels.actions.affectedUrls, width: 60 },
    { header: labels.actions.status, width: 22 },
  ];

  result.tasks.forEach((task, index) => {
    const row = sheet.addRow([
      index + 1,
      reportLabels.priorities[task.priority],
      reportLabels.efforts[task.effort],
      reportLabels.areas[task.area],
      reportLabels.sources[task.source],
      task.name,
      task.description,
      task.affectedUrls.length,
      task.affectedUrls.join('\n'),
      labels.statuses[0],
    ]);

    row.alignment = { vertical: 'top', wrapText: true };
    row.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: PRIORITY_FILL[task.priority] },
    };
    row.getCell(10).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [statusList],
    };
  });

  styleHeaderRow(sheet, 10);
};
