import type { Workbook } from 'exceljs';

import { EXCEL_LABELS } from 'src/constants/excel-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { styleHeaderRow } from 'src/utils/style-header-row.util';

export const addPagesSheet = (workbook: Workbook, result: SeoAuditResult): void => {
  const labels = EXCEL_LABELS[result.language];
  const sheet = workbook.addWorksheet(labels.sheets.pages);
  const assessmentByUrl = new Map(
    result.assessments.map((assessment) => [assessment.url, assessment]),
  );

  sheet.columns = [
    { header: labels.pages.url, width: 60 },
    { header: labels.pages.statusCode, width: 9 },
    { header: labels.pages.responseTime, width: 14 },
    { header: labels.pages.title, width: 44 },
    { header: labels.pages.words, width: 9 },
    { header: labels.pages.headings, width: 6 },
    { header: labels.pages.imagesWithoutAlt, width: 14 },
    { header: labels.pages.structuredData, width: 24 },
    { header: labels.pages.pageType, width: 12 },
    { header: labels.pages.intent, width: 15 },
    { header: labels.pages.helpfulness, width: 12 },
    { header: labels.pages.specificity, width: 12 },
    { header: labels.pages.trust, width: 12 },
    { header: labels.pages.confidence, width: 12 },
    { header: labels.pages.needsReview, width: 9 },
  ];

  result.pages.forEach((page) => {
    const assessment = assessmentByUrl.get(page.url);

    sheet.addRow([
      page.url,
      page.statusCode,
      page.responseTimeMs,
      page.title ?? '',
      page.wordCount,
      page.h1Count,
      page.imagesWithoutAlt,
      page.structuredDataTypes.join(', '),
      assessment?.pageType ?? '',
      assessment?.searchIntent ?? '',
      assessment?.helpfulness ?? '',
      assessment?.specificity ?? '',
      assessment?.trust ?? '',
      assessment?.confidence ?? '',
      assessment === undefined ? '' : assessment.needsReview ? labels.yes : labels.no,
    ]);
  });

  styleHeaderRow(sheet, 15);
};
