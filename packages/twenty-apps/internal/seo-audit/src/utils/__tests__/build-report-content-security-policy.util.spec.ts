import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { REPORT_PRINT_SCRIPT } from 'src/constants/report-print-script.const';
import { buildReportContentSecurityPolicy } from 'src/utils/build-report-content-security-policy.util';

describe('buildReportContentSecurityPolicy', () => {
  it('allows exactly the print script by hash and nothing from the network', () => {
    const policy = buildReportContentSecurityPolicy();
    const hash = createHash('sha256').update(REPORT_PRINT_SCRIPT).digest('base64');

    expect(policy).toContain(`script-src 'sha256-${hash}'`);
    expect(policy).toContain("default-src 'none'");
    expect(policy).not.toContain('unsafe-eval');
    expect(policy).not.toMatch(/https?:/);
  });
});
