import { describe, expect, it } from 'vitest';

import { normalizeAuditDomain } from 'src/utils/normalize-audit-domain.util';

describe('normalizeAuditDomain', () => {
  it('adds https to a bare domain and drops the path', () => {
    expect(normalizeAuditDomain('Example.com/about?x=1')).toBe(
      'https://example.com',
    );
  });

  it('keeps an explicit http scheme so the HTTPS rule can fire', () => {
    expect(normalizeAuditDomain('http://example.com')).toBe('http://example.com');
  });

  it('trims whitespace', () => {
    expect(normalizeAuditDomain('  https://www.example.com/  ')).toBe(
      'https://www.example.com',
    );
  });

  it.each([
    ['', 'Domain is required'],
    ['ftp://example.com', 'Only http and https'],
    ['https://user:pw@example.com', 'credentials or custom ports'],
    ['https://example.com:8443', 'credentials or custom ports'],
    ['http://localhost', 'not a public hostname'],
    ['http://169.254.169.254/latest', 'not a public hostname'],
    ['intranet', 'not a public hostname'],
  ])('rejects %s', (input, message) => {
    expect(() => normalizeAuditDomain(input)).toThrow(message);
  });
});
