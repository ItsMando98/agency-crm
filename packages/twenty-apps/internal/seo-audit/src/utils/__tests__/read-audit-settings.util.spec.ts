import { describe, expect, it } from 'vitest';

import { readAuditSettings } from 'src/utils/read-audit-settings.util';

describe('readAuditSettings', () => {
  it('falls back to German and the maximum page count', () => {
    expect(readAuditSettings({})).toEqual({ defaultLanguage: 'DE', maxPages: 60 });
  });

  it('reads language and page count from the variables', () => {
    expect(
      readAuditSettings({ SEO_AUDIT_DEFAULT_LANGUAGE: ' EN ', SEO_AUDIT_MAX_PAGES: '25' }),
    ).toEqual({ defaultLanguage: 'EN', maxPages: 25 });
  });

  it('clamps the page count into the allowed range', () => {
    expect(readAuditSettings({ SEO_AUDIT_MAX_PAGES: '500' }).maxPages).toBe(60);
    expect(readAuditSettings({ SEO_AUDIT_MAX_PAGES: '12.9' }).maxPages).toBe(12);
  });

  it.each(['0', '-5', 'many', ''])('ignores the invalid page count "%s"', (value) => {
    expect(readAuditSettings({ SEO_AUDIT_MAX_PAGES: value }).maxPages).toBe(60);
  });

  it('ignores unknown languages', () => {
    expect(readAuditSettings({ SEO_AUDIT_DEFAULT_LANGUAGE: 'FR' }).defaultLanguage).toBe('DE');
  });
});
