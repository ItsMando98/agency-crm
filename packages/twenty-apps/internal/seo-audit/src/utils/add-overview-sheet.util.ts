import type { Workbook } from 'exceljs';

import { EXCEL_LABELS } from 'src/constants/excel-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SeoArea } from 'src/types/seo-area';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { formatReportDate } from 'src/utils/format-report-date.util';
import { getScoreBand } from 'src/utils/get-score-band.util';

export const addOverviewSheet = (workbook: Workbook, result: SeoAuditResult): void => {
  const labels = EXCEL_LABELS[result.language];
  const reportLabels = REPORT_LABELS[result.language];
  const bandLabels = REPORT_HTML_LABELS[result.language].bands;
  const sheet = workbook.addWorksheet(labels.sheets.overview);

  sheet.columns = [{ width: 28 }, { width: 24 }, { width: 18 }];
  sheet.addRows([
    [labels.overview.domain, new URL(result.origin).hostname],
    [labels.overview.generatedOn, formatReportDate(result.generatedAt, result.language)],
    [labels.overview.score, result.score],
    [labels.overview.grade, result.grade],
    [labels.overview.pages, result.pages.length],
    [labels.overview.tasks, result.tasks.length],
    [],
    [labels.overview.area, labels.overview.areaScore, labels.overview.band],
  ]);

  for (let row = 1; row <= 6; row += 1) {
    sheet.getCell(row, 1).font = { bold: true };
  }

  const headerRow = sheet.getRow(8);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (let column = 1; column <= 3; column += 1) {
    headerRow.getCell(column).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B0B0B' },
    };
  }

  (Object.entries(result.areaScores) as [SeoArea, number][])
    .sort((first, second) => second[1] - first[1])
    .forEach(([area, score]) => {
      sheet.addRow([reportLabels.areas[area], score, bandLabels[getScoreBand(score)]]);
    });
};
