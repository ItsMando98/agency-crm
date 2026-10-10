export const CONNECTION_SERVICES = [
  'ANTHROPIC',
  'DATAFORSEO',
  'TREG',
  'PDF_RENDERER',
] as const;

export const CONNECTION_TEST_ROUTE_PATH = '/seo-audit/test-connection';
export const CONNECTION_TEST_TIMEOUT_MS = 20_000;
export const TREG_TOOLS_PATH = '/tools';
export const CONNECTION_TEST_PDF_HTML =
  '<!doctype html><html><body><p>SEO Audit connection test</p></body></html>';
