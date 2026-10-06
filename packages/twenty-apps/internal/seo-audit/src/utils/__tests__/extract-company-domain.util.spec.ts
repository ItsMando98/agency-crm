import { describe, expect, it } from 'vitest';

import { extractCompanyDomain } from 'src/utils/extract-company-domain.util';

describe('extractCompanyDomain', () => {
  it('reads the primary link of the company', () => {
    expect(extractCompanyDomain({ domainName: { primaryLinkUrl: ' https://acme.de ' } })).toBe('https://acme.de');
  });

  it('returns null without a website', () => {
    expect(extractCompanyDomain({ domainName: { primaryLinkUrl: '' } })).toBeNull();
    expect(extractCompanyDomain({ domainName: null })).toBeNull();
    expect(extractCompanyDomain(undefined)).toBeNull();
  });
});
