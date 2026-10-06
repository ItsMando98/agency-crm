import type { Workbook } from 'exceljs';

import { EXCEL_LABELS } from 'src/constants/excel-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { styleHeaderRow } from 'src/utils/style-header-row.util';

export const addCompetitorsSheet = (workbook: Workbook, result: SeoAuditResult): void => {
  const labels = EXCEL_LABELS[result.language];
  const sheet = workbook.addWorksheet(labels.sheets.competitors);

  sheet.columns = [
    { header: labels.competitors.domain, width: 40 },
    { header: labels.competitors.commonKeywords, width: 20 },
    { header: labels.competitors.traffic, width: 20 },
  ];

  (result.marketData?.competitors ?? []).forEach((competitor) => {
    sheet.addRow([
      competitor.domain,
      competitor.commonKeywords,
      Math.round(competitor.estimatedTraffic),
    ]);
  });

  styleHeaderRow(sheet, 3);
};
