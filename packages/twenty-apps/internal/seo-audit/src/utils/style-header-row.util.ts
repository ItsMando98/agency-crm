import type { Worksheet } from 'exceljs';

export const styleHeaderRow = (sheet: Worksheet, columnCount: number): void => {
  const header = sheet.getRow(1);

  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.alignment = { vertical: 'middle', wrapText: true };
  header.height = 22;

  for (let column = 1; column <= columnCount; column += 1) {
    header.getCell(column).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B0B0B' },
    };
  }

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columnCount },
  };
};
