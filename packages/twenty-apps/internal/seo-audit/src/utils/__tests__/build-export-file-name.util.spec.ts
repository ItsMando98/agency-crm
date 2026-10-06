import { describe, expect, it } from 'vitest';

import { buildExportFileName } from 'src/utils/build-export-file-name.util';

describe('buildExportFileName', () => {
  it('builds a safe name from host, date and extension', () => {
    expect(buildExportFileName('https://www.kanzlei-beispiel.de', '2026-10-06T10:00:00.000Z', 'xlsx')).toBe(
      'seo-audit-kanzlei-beispiel-de-2026-10-06.xlsx',
    );
    expect(buildExportFileName('https://shop.example.com', '2026-10-06T10:00:00.000Z', 'pdf')).toBe(
      'seo-audit-shop-example-com-2026-10-06.pdf',
    );
  });
});
