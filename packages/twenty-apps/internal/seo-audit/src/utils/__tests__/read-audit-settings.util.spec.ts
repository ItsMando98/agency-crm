import { describe, expect, it } from 'vitest';

import { readAuditSettings } from 'src/utils/read-audit-settings.util';

describe('readAuditSettings', () => {
  it('falls back to German and the maximum page count', () => {
    expect(readAuditSettings({})).toEqual({
      defaultLanguage: 'DE',
      maxPages: 60,
      market: 'DE',
      isAiVisibilityEnabled: false,
      isAiSummaryEnabled: true,
    });
  });

  it('reads language and page count from the variables', () => {
    expect(
      readAuditSettings({ SEO_AUDIT_DEFAULT_LANGUAGE: ' EN ', SEO_AUDIT_MAX_PAGES: '25' }),
    ).toEqual({
      defaultLanguage: 'EN',
      maxPages: 25,
      market: 'DE',
      isAiVisibilityEnabled: false,
      isAiSummaryEnabled: true,
    });
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

  it('reads the market and ignores unknown ones', () => {
    expect(readAuditSettings({ SEO_AUDIT_MARKET: 'CH' }).market).toBe('CH');
    expect(readAuditSettings({ SEO_AUDIT_MARKET: 'XX' }).market).toBe('DE');
    expect(readAuditSettings({ SEO_AUDIT_MARKET: 'toString' }).market).toBe('DE');
  });

  it('switches the AI visibility check on only for the value ON', () => {
    expect(readAuditSettings({ SEO_AUDIT_AI_VISIBILITY: 'ON' }).isAiVisibilityEnabled).toBe(true);
    expect(readAuditSettings({ SEO_AUDIT_AI_VISIBILITY: ' ON ' }).isAiVisibilityEnabled).toBe(true);
    expect(readAuditSettings({ SEO_AUDIT_AI_VISIBILITY: 'OFF' }).isAiVisibilityEnabled).toBe(false);
    expect(readAuditSettings({ SEO_AUDIT_AI_VISIBILITY: 'true' }).isAiVisibilityEnabled).toBe(false);
    expect(readAuditSettings({}).isAiVisibilityEnabled).toBe(false);
  });

  it('keeps the summary on unless it is switched off', () => {
    expect(readAuditSettings({}).isAiSummaryEnabled).toBe(true);
    expect(readAuditSettings({ SEO_AUDIT_AI_SUMMARY: 'ON' }).isAiSummaryEnabled).toBe(true);
    expect(readAuditSettings({ SEO_AUDIT_AI_SUMMARY: ' OFF ' }).isAiSummaryEnabled).toBe(false);
  });
});
