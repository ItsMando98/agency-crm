import type { Workbook } from 'exceljs';

import { EXCEL_LABELS } from 'src/constants/excel-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';

export const addBacklinksSheet = (workbook: Workbook, result: SeoAuditResult): void => {
  const labels = EXCEL_LABELS[result.language];
  const backlinks = result.marketData?.backlinks ?? null;
  const sheet = workbook.addWorksheet(labels.sheets.backlinks);

  sheet.columns = [{ width: 52 }, { width: 14 }, { width: 14 }];
  sheet.addRow([labels.backlinks.metric, labels.backlinks.value]);

  if (backlinks !== null) {
    sheet.addRows([
      [labels.backlinks.backlinks, backlinks.backlinks],
      [labels.backlinks.referringDomains, backlinks.referringDomains],
      ...(backlinks.brokenPages === null
        ? []
        : [[labels.backlinks.brokenPages, backlinks.brokenPages]]),
    ]);
  }

  sheet.addRow([]);
  sheet.addRow([
    labels.backlinks.brokenTargetsHeading,
    labels.backlinks.backlinksColumn,
    labels.backlinks.domainsColumn,
  ]);

  const tableHeaderRow = sheet.lastRow;

  result.brokenBacklinkTargets.forEach((target) => {
    sheet.addRow([target.url, target.backlinks, target.referringDomains]);
  });

  for (const row of [sheet.getRow(1), tableHeaderRow]) {
    if (row === undefined) {
      continue;
    }

    row.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (let column = 1; column <= 3; column += 1) {
      row.getCell(column).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0B0B0B' },
      };
    }
  }
};
