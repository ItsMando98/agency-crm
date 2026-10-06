import { renderPdfFromHtml } from 'src/pdf-client/render-pdf-from-html';
import { type AuditExports } from 'src/types/audit-exports';
import { type PdfRendererSettings } from 'src/types/pdf-renderer-settings';
import { type ReportBranding } from 'src/types/report-branding';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildAuditWorkbook } from 'src/utils/build-audit-workbook.util';
import { buildReportHtml } from 'src/utils/build-report-html.util';

type BuildAuditExportsParams = {
  result: SeoAuditResult;
  branding: ReportBranding;
  pdfRenderer: PdfRendererSettings | null;
  fetchImplementation?: typeof fetch;
};

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'unknown error';

// The HTML report is the source of truth. The PDF is rendered from it, and a
// failing export never fails the audit: it is reported in the notes instead.
export const buildAuditExports = async ({
  result,
  branding,
  pdfRenderer,
  fetchImplementation,
}: BuildAuditExportsParams): Promise<AuditExports> => {
  const notes: string[] = [];
  const reportHtml = buildReportHtml(result, branding);
  let excelBuffer: Buffer | null = null;
  let pdfBytes: Uint8Array | null = null;

  try {
    excelBuffer = await buildAuditWorkbook(result, branding);
  } catch (error) {
    notes.push(`Excel export failed: ${toMessage(error)}`);
  }

  if (pdfRenderer !== null) {
    try {
      pdfBytes = await renderPdfFromHtml({
        html: reportHtml,
        settings: pdfRenderer,
        fetchImplementation,
      });
    } catch (error) {
      notes.push(`PDF export failed: ${toMessage(error)}`);
    }
  }

  return { reportHtml, excelBuffer, pdfBytes, notes };
};
