import { describe, expect, it } from 'vitest';

import { readReportBranding } from 'src/utils/read-report-branding.util';

describe('readReportBranding', () => {
  it('defaults to no brand name, the red accent and no booking link', () => {
    expect(readReportBranding({})).toEqual({ brandName: null, accentColor: '#d81b2c', bookingUrl: null });
  });

  it('reads a trimmed brand name and a valid hex color', () => {
    expect(
      readReportBranding({ SEO_AUDIT_BRAND_NAME: '  Muster Agentur ', SEO_AUDIT_ACCENT_COLOR: '#7A3AA7' }),
    ).toEqual({ brandName: 'Muster Agentur', accentColor: '#7A3AA7', bookingUrl: null });
  });

  it.each(['red', '#fff', 'url(javascript:alert(1))', '#12345g', '}</style><script>'])(
    'falls back to the default for the invalid color %s',
    (color) => {
      expect(readReportBranding({ SEO_AUDIT_ACCENT_COLOR: color }).accentColor).toBe('#d81b2c');
    },
  );

  it('keeps a https booking link', () => {
    expect(readReportBranding({ SEO_AUDIT_BOOKING_URL: ' https://cal.example.com/me ' }).bookingUrl).toBe(
      'https://cal.example.com/me',
    );
  });

  it.each(['http://cal.example.com', 'javascript:alert(1)', 'cal.example.com', ''])(
    'drops the booking link %s',
    (value) => {
      expect(readReportBranding({ SEO_AUDIT_BOOKING_URL: value }).bookingUrl).toBeNull();
    },
  );

  it('caps very long brand names', () => {
    expect(readReportBranding({ SEO_AUDIT_BRAND_NAME: 'x'.repeat(300) }).brandName).toHaveLength(80);
  });
});
