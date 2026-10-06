import { createHash } from 'node:crypto';

import { REPORT_PRINT_SCRIPT } from 'src/constants/report-print-script.const';

// The Twenty server drops most response headers on route responses and serves
// HTML on the app origin, so the policy travels inside the page itself. It
// allows inline styles and exactly one script, nothing else.
export const buildReportContentSecurityPolicy = (): string => {
  const scriptHash = createHash('sha256').update(REPORT_PRINT_SCRIPT).digest('base64');

  return `default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${scriptHash}'; img-src data:; base-uri 'none'; form-action 'none'`;
};
