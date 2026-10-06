import type { Workbook } from 'exceljs';

import { EXCEL_LABELS } from 'src/constants/excel-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { styleHeaderRow } from 'src/utils/style-header-row.util';

export const addReviewSheet = (workbook: Workbook, result: SeoAuditResult): void => {
  const labels = EXCEL_LABELS[result.language];
  const sheet = workbook.addWorksheet(labels.sheets.review);

  sheet.columns = [
    { header: labels.review.type, width: 12 },
    { header: labels.review.item, width: 70 },
    { header: labels.pages.confidence, width: 14 },
  ];

  result.assessments
    .filter((assessment) => assessment.needsReview)
    .forEach((assessment) => {
      sheet.addRow([labels.review.page, assessment.url, assessment.confidence]);
    });

  result.keywords
    .filter((keyword) => keyword.needsReview && keyword.relevance !== null)
    .forEach((keyword) => {
      sheet.addRow([labels.review.keyword, keyword.keyword, keyword.confidence ?? '']);
    });

  styleHeaderRow(sheet, 3);
};
