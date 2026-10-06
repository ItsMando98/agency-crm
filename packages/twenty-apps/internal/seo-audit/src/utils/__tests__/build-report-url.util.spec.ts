import { describe, expect, it } from 'vitest';

import { buildReportUrl } from 'src/utils/build-report-url.util';

describe('buildReportUrl', () => {
  it('points at the route under /s with id and token', () => {
    expect(buildReportUrl({ serverUrl: 'https://crm.example.com/', auditId: 'a-1', shareToken: 'tok' })).toBe(
      'https://crm.example.com/s/seo-audit/report?id=a-1&token=tok',
    );
  });

  it('returns null without a server URL', () => {
    expect(buildReportUrl({ serverUrl: undefined, auditId: 'a-1', shareToken: 'tok' })).toBeNull();
    expect(buildReportUrl({ serverUrl: ' ', auditId: 'a-1', shareToken: 'tok' })).toBeNull();
  });
});
