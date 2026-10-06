import { type MetadataApiClient } from 'twenty-client-sdk/metadata';

import {
  SEO_AUDIT_EXCEL_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_PDF_FILE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/seo-audit.object';
import { type AuditExports } from 'src/types/audit-exports';
import { buildExportFileName } from 'src/utils/build-export-file-name.util';

type FileReference = { fileId: string; label: string }[];

type UploadAuditFilesParams = {
  client: Pick<MetadataApiClient, 'uploadFile'>;
  exports: Pick<AuditExports, 'excelBuffer' | 'pdfBytes'>;
  origin: string;
  generatedAt: string;
};

type UploadedAuditFiles = {
  excelFile: FileReference | null;
  pdfFile: FileReference | null;
  notes: string[];
};

export const uploadAuditFiles = async ({
  client,
  exports,
  origin,
  generatedAt,
}: UploadAuditFilesParams): Promise<UploadedAuditFiles> => {
  const notes: string[] = [];

  const upload = async (
    content: Buffer | Uint8Array | null,
    extension: 'xlsx' | 'pdf',
    fieldMetadataUniversalIdentifier: string,
  ): Promise<FileReference | null> => {
    if (content === null) {
      return null;
    }

    const fileName = buildExportFileName(origin, generatedAt, extension);

    try {
      const uploaded = await client.uploadFile({
        fileBuffer: Buffer.from(content),
        filename: fileName,
        fieldMetadataUniversalIdentifier,
      });

      return [{ fileId: uploaded.id, label: fileName }];
    } catch (error) {
      notes.push(
        `Upload of ${extension} failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return null;
    }
  };

  const [excelFile, pdfFile] = await Promise.all([
    upload(exports.excelBuffer, 'xlsx', SEO_AUDIT_EXCEL_FILE_FIELD_UNIVERSAL_IDENTIFIER),
    upload(exports.pdfBytes, 'pdf', SEO_AUDIT_PDF_FILE_FIELD_UNIVERSAL_IDENTIFIER),
  ]);

  return { excelFile, pdfFile, notes };
};
