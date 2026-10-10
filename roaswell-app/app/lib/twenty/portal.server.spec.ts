import { describe, expect, it, vi } from 'vitest';

import { type Principal } from '~/lib/auth/principal';
import { findPortalContact, grantPortalAccess, revokePortalAccess } from '~/lib/twenty/portal.server';
import { type TwentyClient } from '~/lib/twenty/twenty-client.server';

const team: Principal = { kind: 'TEAM', email: 'team@roaswell.com' };
const client: Principal = { kind: 'CLIENT', email: 'kunde@firma.de', companyId: 'company-1' };
const emptyPage = { records: [], totalCount: 0, endCursor: null, hasNextPage: false };

const buildClient = (overrides: Partial<TwentyClient> = {}): TwentyClient => ({
  findMany: vi.fn(async () => emptyPage),
  findOne: vi.fn(async () => null),
  create: vi.fn(async () => null),
  update: vi.fn(async () => null),
  ...overrides,
});

describe('findPortalContact', () => {
  it('asks for the email and the portal flag together', async () => {
    const findMany = vi.fn(async () => ({ ...emptyPage, records: [{ id: 'p1', companyId: 'c1' }] }));

    const contact = await findPortalContact(buildClient({ findMany }), 'kunde@firma.de');

    expect(contact).toEqual({ personId: 'p1', companyId: 'c1' });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        object: 'people',
        filter: 'and(emails.primaryEmail[eq]:"kunde@firma.de",portalAccess[eq]:"true")',
      }),
    );
  });

  it('returns nothing when no contact matches or two do', async () => {
    expect(await findPortalContact(buildClient(), 'x@y.de')).toBeNull();
    expect(
      await findPortalContact(
        buildClient({ findMany: vi.fn(async () => ({ ...emptyPage, records: [{ id: 'a' }, { id: 'b' }] })) }),
        'x@y.de',
      ),
    ).toBeNull();
  });
});

describe('grantPortalAccess', () => {
  const person = { id: 'p1', emails: { primaryEmail: 'Kunde@Firma.de' }, companyId: 'c1' };

  it('sets the flag for a contact with email and company', async () => {
    const update = vi.fn(async () => ({ id: 'p1' }));

    const result = await grantPortalAccess(buildClient({ findOne: vi.fn(async () => person), update }), team, 'p1');

    expect(result).toEqual({ email: 'kunde@firma.de' });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1', data: { portalAccess: true } }));
  });

  it.each([
    ['no email', { id: 'p1', companyId: 'c1' }],
    ['no company', { id: 'p1', emails: { primaryEmail: 'a@b.de' } }],
  ])('refuses a contact with %s', async (_label, record) => {
    const update = vi.fn();

    expect(await grantPortalAccess(buildClient({ findOne: vi.fn(async () => record), update }), team, 'p1')).toBeNull();
    expect(update).not.toHaveBeenCalled();
  });

  it('never lets a client change access', async () => {
    const update = vi.fn();
    const twenty = buildClient({ findOne: vi.fn(async () => person), update });

    expect(await grantPortalAccess(twenty, client, 'p1')).toBeNull();
    expect(await revokePortalAccess(twenty, client, 'p1')).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('removes the flag again', async () => {
    const update = vi.fn(async () => ({ id: 'p1' }));

    expect(await revokePortalAccess(buildClient({ update }), team, 'p1')).toBe(true);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { portalAccess: false } }));
  });
});
