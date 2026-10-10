import { describe, expect, it, vi } from 'vitest';

import { resolvePrincipalFromDirectory } from '~/lib/auth/resolve-principal';

const teamEmails = ['team@roaswell.com'];

describe('resolvePrincipalFromDirectory', () => {
  it('treats a listed address as team without asking the directory', async () => {
    const findPortalContact = vi.fn();

    expect(await resolvePrincipalFromDirectory(' Team@Roaswell.com ', { teamEmails, findPortalContact })).toEqual({
      kind: 'TEAM',
      email: 'team@roaswell.com',
    });
    expect(findPortalContact).not.toHaveBeenCalled();
  });

  it('turns a contact with portal access into a client of their company', async () => {
    const findPortalContact = vi.fn(async () => ({ companyId: 'company-7' }));

    expect(await resolvePrincipalFromDirectory('kunde@firma.de', { teamEmails, findPortalContact })).toEqual({
      kind: 'CLIENT',
      email: 'kunde@firma.de',
      companyId: 'company-7',
    });
  });

  it('refuses unknown addresses and contacts without a company', async () => {
    expect(await resolvePrincipalFromDirectory('x@y.de', { teamEmails, findPortalContact: async () => null })).toBeNull();
    expect(
      await resolvePrincipalFromDirectory('x@y.de', { teamEmails, findPortalContact: async () => ({ companyId: null }) }),
    ).toBeNull();
    expect(await resolvePrincipalFromDirectory('   ', { teamEmails, findPortalContact: vi.fn() })).toBeNull();
  });

  it('does not grant access when the directory fails', async () => {
    const findPortalContact = vi.fn(async () => {
      throw new Error('Twenty is down');
    });

    expect(await resolvePrincipalFromDirectory('kunde@firma.de', { teamEmails, findPortalContact })).toBeNull();
  });
});
