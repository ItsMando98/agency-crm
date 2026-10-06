import { describe, expect, it } from 'vitest';

import { readReportBranding } from 'src/utils/read-report-branding.util';

describe('readReportBranding', () => {
  it('defaults to no brand name and the blue accent', () => {
    expect(readReportBranding({})).toEqual({ brandName: null, accentColor: '#2a78d6' });
  });

  it('reads a trimmed brand name and a valid hex color', () => {
    expect(
      readReportBranding({ SEO_AUDIT_BRAND_NAME: '  Muster Agentur ', SEO_AUDIT_ACCENT_COLOR: '#7A3AA7' }),
    ).toEqual({ brandName: 'Muster Agentur', accentColor: '#7A3AA7' });
  });

  it.each(['red', '#fff', 'url(javascript:alert(1))', '#12345g', '}</style><script>'])(
    'falls back to the default for the invalid color %s',
    (color) => {
      expect(readReportBranding({ SEO_AUDIT_ACCENT_COLOR: color }).accentColor).toBe('#2a78d6');
    },
  );

  it('caps very long brand names', () => {
    expect(readReportBranding({ SEO_AUDIT_BRAND_NAME: 'x'.repeat(300) }).brandName).toHaveLength(80);
  });
});
