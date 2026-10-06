export const buildExportFileName = (
  origin: string,
  generatedAt: string,
  extension: 'xlsx' | 'pdf',
): string => {
  const hostname = new URL(origin).hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-');

  return `seo-audit-${hostname}-${generatedAt.slice(0, 10)}.${extension}`;
};
