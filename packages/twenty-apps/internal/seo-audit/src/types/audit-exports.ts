export type AuditExports = {
  reportHtml: string;
  excelBuffer: Buffer | null;
  pdfBytes: Uint8Array | null;
  // One line per export that could not be produced.
  notes: string[];
};
