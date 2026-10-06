import type { Workbook } from 'exceljs';

import { EXCEL_LABELS } from 'src/constants/excel-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { styleHeaderRow } from 'src/utils/style-header-row.util';

export const addKeywordsSheet = (workbook: Workbook, result: SeoAuditResult): void => {
  const labels = EXCEL_LABELS[result.language];
  const sheet = workbook.addWorksheet(labels.sheets.keywords);

  sheet.columns = [
    { header: labels.keywords.keyword, width: 40 },
    { header: labels.keywords.position, width: 9 },
    { header: labels.keywords.volume, width: 16 },
    { header: labels.keywords.traffic, width: 18 },
    { header: labels.keywords.category, width: 18 },
    { header: labels.keywords.relevance, width: 14 },
    { header: labels.keywords.confidence, width: 14 },
    { header: labels.keywords.needsReview, width: 9 },
    { header: labels.keywords.page, width: 60 },
  ];

  [...result.keywords]
    .sort((first, second) => second.searchVolume - first.searchVolume)
    .forEach((keyword) => {
      sheet.addRow([
        keyword.keyword,
        keyword.position,
        keyword.searchVolume,
        Math.round(keyword.estimatedTraffic),
        keyword.category,
        keyword.relevance ?? '',
        keyword.confidence ?? '',
        keyword.needsReview ? labels.yes : labels.no,
        keyword.url ?? '',
      ]);
    });

  styleHeaderRow(sheet, 9);
};
