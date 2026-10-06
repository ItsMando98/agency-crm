import { describe, expect, it } from 'vitest';

import { readReportBaseUrl } from 'src/utils/read-report-base-url.util';

describe('readReportBaseUrl', () => {
  it('prefers the configured workspace URL', () => {
    expect(
      readReportBaseUrl({ SEO_AUDIT_PUBLIC_URL: ' https://crm.example.com ', TWENTY_API_URL: 'http://server:3000' }),
    ).toBe('https://crm.example.com');
  });

  it('falls back to the server URL', () => {
    expect(readReportBaseUrl({ TWENTY_API_URL: 'http://server:3000' })).toBe('http://server:3000');
    expect(readReportBaseUrl({ SEO_AUDIT_PUBLIC_URL: '  ', TWENTY_API_URL: 'http://server:3000' })).toBe(
      'http://server:3000',
    );
  });

  it('returns undefined when nothing is known', () => {
    expect(readReportBaseUrl({})).toBeUndefined();
  });
});
