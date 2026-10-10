import { describe, expect, it } from 'vitest';

import { buildReportLink } from '~/lib/build-report-link';

describe('buildReportLink', () => {
  it('builds the public report address on the workspace host', () => {
    expect(
      buildReportLink({ publicBaseUrl: 'https://crm.roaswell.com/', auditId: 'a-1', shareToken: 'tok en' }),
    ).toBe('https://crm.roaswell.com/s/seo-audit/report?id=a-1&token=tok+en');
  });

  it('has no link when the audit has no share token', () => {
    expect(buildReportLink({ publicBaseUrl: 'https://crm.roaswell.com', auditId: 'a-1', shareToken: null })).toBeNull();
    expect(buildReportLink({ publicBaseUrl: 'https://crm.roaswell.com', auditId: 'a-1', shareToken: '' })).toBeNull();
  });
});
