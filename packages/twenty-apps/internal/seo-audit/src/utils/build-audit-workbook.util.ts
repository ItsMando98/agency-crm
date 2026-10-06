import ExcelJS from 'exceljs';

import { type ReportBranding } from 'src/types/report-branding';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { addActionListSheet } from 'src/utils/add-action-list-sheet.util';
import { addBacklinksSheet } from 'src/utils/add-backlinks-sheet.util';
import { addCompetitorsSheet } from 'src/utils/add-competitors-sheet.util';
import { addKeywordsSheet } from 'src/utils/add-keywords-sheet.util';
import { addOverviewSheet } from 'src/utils/add-overview-sheet.util';
import { addPagesSheet } from 'src/utils/add-pages-sheet.util';
import { addReviewSheet } from 'src/utils/add-review-sheet.util';

// Market sheets are only added when DataForSEO delivered data, so a workbook
// never contains empty tabs that look like failures.
export const buildAuditWorkbook = async (
  result: SeoAuditResult,
  branding: ReportBranding,
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = branding.brandName ?? 'SEO Audit';
  workbook.created = new Date(result.generatedAt);

  addOverviewSheet(workbook, result);
  addActionListSheet(workbook, result);
  addPagesSheet(workbook, result);

  if (result.keywords.length > 0) {
    addKeywordsSheet(workbook, result);
  }

  if (result.marketData?.backlinks != null || result.brokenBacklinkTargets.length > 0) {
    addBacklinksSheet(workbook, result);
  }

  if ((result.marketData?.competitors.length ?? 0) > 0) {
    addCompetitorsSheet(workbook, result);
  }

  if (
    result.assessments.some((assessment) => assessment.needsReview) ||
    result.keywords.some((keyword) => keyword.needsReview && keyword.relevance !== null)
  ) {
    addReviewSheet(workbook, result);
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
};
