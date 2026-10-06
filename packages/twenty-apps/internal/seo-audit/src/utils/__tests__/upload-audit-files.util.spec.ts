import { describe, expect, it, vi } from 'vitest';

import {
  SEO_AUDIT_EXCEL_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_PDF_FILE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/seo-audit.object';
import { uploadAuditFiles } from 'src/utils/upload-audit-files.util';

const PARAMS = {
  origin: 'https://www.kanzlei-beispiel.de',
  generatedAt: '2026-10-06T10:00:00.000Z',
};

describe('uploadAuditFiles', () => {
  it('uploads each file to its own field and returns the file references', async () => {
    const uploadFile = vi
      .fn()
      .mockImplementation(async ({ filename }: { filename: string }) => ({ id: `id-${filename}` }));

    const uploaded = await uploadAuditFiles({
      client: { uploadFile },
      exports: { excelBuffer: Buffer.from('xlsx'), pdfBytes: new Uint8Array([37, 80, 68, 70]) },
      ...PARAMS,
    });

    expect(uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'seo-audit-kanzlei-beispiel-de-2026-10-06.xlsx',
        fieldMetadataUniversalIdentifier: SEO_AUDIT_EXCEL_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );
    expect(uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'seo-audit-kanzlei-beispiel-de-2026-10-06.pdf',
        fieldMetadataUniversalIdentifier: SEO_AUDIT_PDF_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );
    expect(uploaded).toEqual({
      excelFile: [{ fileId: 'id-seo-audit-kanzlei-beispiel-de-2026-10-06.xlsx', label: 'seo-audit-kanzlei-beispiel-de-2026-10-06.xlsx' }],
      pdfFile: [{ fileId: 'id-seo-audit-kanzlei-beispiel-de-2026-10-06.pdf', label: 'seo-audit-kanzlei-beispiel-de-2026-10-06.pdf' }],
      notes: [],
    });
  });

  it('skips files that do not exist', async () => {
    const uploadFile = vi.fn();

    const uploaded = await uploadAuditFiles({
      client: { uploadFile },
      exports: { excelBuffer: null, pdfBytes: null },
      ...PARAMS,
    });

    expect(uploadFile).not.toHaveBeenCalled();
    expect(uploaded).toEqual({ excelFile: null, pdfFile: null, notes: [] });
  });

  it('reports a failed upload without losing the other file', async () => {
    const uploadFile = vi
      .fn()
      .mockImplementation(async ({ filename }: { filename: string }) => {
        if (filename.endsWith('.pdf')) {
          throw new Error('storage unavailable');
        }

        return { id: 'excel-id' };
      });

    const uploaded = await uploadAuditFiles({
      client: { uploadFile },
      exports: { excelBuffer: Buffer.from('xlsx'), pdfBytes: new Uint8Array([1]) },
      ...PARAMS,
    });

    expect(uploaded.excelFile).not.toBeNull();
    expect(uploaded.pdfFile).toBeNull();
    expect(uploaded.notes).toEqual(['Upload of pdf failed: storage unavailable']);
  });
});
