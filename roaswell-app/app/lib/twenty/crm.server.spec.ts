import { describe, expect, it, vi } from 'vitest';

import { type Principal } from '~/lib/auth/principal';
import {
  createCompany,
  createCompanyNote,
  createOpportunity,
  createPerson,
  listCompanies,
  listCompanyNotes,
  listOpportunities,
  listPeople,
  moveOpportunity,
  updateCrmTaskStatus,
} from '~/lib/twenty/crm.server';
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

describe('crm data layer', () => {
  it('maps a company with its nested domain and city', async () => {
    const findMany = vi.fn(async () => ({
      ...emptyPage,
      totalCount: 1,
      records: [
        { id: 'c1', name: 'Muster GmbH', domainName: { primaryLinkUrl: 'https://muster.de' }, address: { addressCity: 'Berlin' }, employees: 12 },
      ],
    }));

    const { companies } = await listCompanies(buildClient({ findMany }), team, { search: 'Mus' });

    expect(companies).toEqual([
      { id: 'c1', name: 'Muster GmbH', domain: 'https://muster.de', city: 'Berlin', employees: 12, createdAt: null },
    ]);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ object: 'companies', filter: 'and(name[ilike]:"%Mus%")' }),
    );
  });

  it('gives a client login no CRM data and no write access', async () => {
    const twenty = buildClient();

    expect(await listCompanies(twenty, client)).toEqual({ companies: [], totalCount: 0 });
    expect(await listPeople(twenty, client)).toEqual([]);
    expect(await listOpportunities(twenty, client)).toEqual([]);
    expect(await listCompanyNotes(twenty, client, 'c1')).toEqual([]);
    expect(await createCompany(twenty, client, { name: 'X' })).toBeNull();
    expect(await createPerson(twenty, client, { firstName: 'A', lastName: 'B' })).toBeNull();
    expect(await createOpportunity(twenty, client, { name: 'Deal' })).toBeNull();
    expect(await moveOpportunity(twenty, client, 'o1', 'MEETING')).toBe(false);
    expect(await updateCrmTaskStatus(twenty, client, 't1', 'DONE')).toBe(false);
    expect(twenty.findMany).not.toHaveBeenCalled();
    expect(twenty.create).not.toHaveBeenCalled();
    expect(twenty.update).not.toHaveBeenCalled();
  });

  it('creates a company with the domain in the links field', async () => {
    const create = vi.fn(async () => ({ id: 'new-company' }));

    const result = await createCompany(buildClient({ create }), team, { name: ' Muster ', domain: 'https://muster.de' });

    expect(result).toEqual({ id: 'new-company' });
    expect(create).toHaveBeenCalledWith({
      object: 'companies',
      singular: 'company',
      data: { name: 'Muster', domainName: { primaryLinkUrl: 'https://muster.de' } },
    });
  });

  it('creates a person attached to a company', async () => {
    const create = vi.fn(async () => ({ id: 'p1' }));

    await createPerson(buildClient({ create }), team, {
      firstName: 'Mara',
      lastName: 'Muster',
      email: 'mara@muster.de',
      companyId: 'c1',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: { firstName: 'Mara', lastName: 'Muster' }, emails: { primaryEmail: 'mara@muster.de' }, companyId: 'c1' },
      }),
    );
  });

  it('converts the amount between euros and micros', async () => {
    const create = vi.fn(async () => ({ id: 'o1' }));
    const findMany = vi.fn(async () => ({
      ...emptyPage,
      records: [{ id: 'o1', name: 'SEO Retainer', stage: 'MEETING', amount: { amountMicros: 4_800_000_000, currencyCode: 'EUR' } }],
    }));
    const twenty = buildClient({ create, findMany });

    await createOpportunity(twenty, team, { name: 'SEO Retainer', amount: 4800, companyId: 'c1' });
    const [deal] = await listOpportunities(twenty, team);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'SEO Retainer', stage: 'NEW', companyId: 'c1', amount: { amountMicros: 4_800_000_000, currencyCode: 'EUR' } },
      }),
    );
    expect(deal).toMatchObject({ stage: 'MEETING', amount: 4800, currency: 'EUR' });
  });

  it('refuses an unknown stage', async () => {
    const update = vi.fn();

    expect(await moveOpportunity(buildClient({ update }), team, 'o1', 'WON' as never)).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('links a new note to its company through a note target', async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ id: 'note-1' })
      .mockResolvedValueOnce({ id: 'target-1' });

    const result = await createCompanyNote(buildClient({ create }), team, 'c1', { title: 'Call', body: 'Interessiert an SEO' });

    expect(result).toEqual({ id: 'note-1' });
    expect(create).toHaveBeenNthCalledWith(1, {
      object: 'notes',
      singular: 'note',
      data: { title: 'Call', bodyV2: { markdown: 'Interessiert an SEO' } },
    });
    expect(create).toHaveBeenNthCalledWith(2, {
      object: 'noteTargets',
      singular: 'noteTarget',
      data: { noteId: 'note-1', companyId: 'c1' },
    });
  });

  it('loads the notes of a company through its targets', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValueOnce({ ...emptyPage, records: [{ id: 't1', noteId: 'n1' }, { id: 't2', noteId: 'n2' }] })
      .mockResolvedValueOnce({
        ...emptyPage,
        records: [{ id: 'n1', title: 'Call', bodyV2: { markdown: 'Text' } }, { id: 'n2', title: 'Mail' }],
      });

    const notes = await listCompanyNotes(buildClient({ findMany }), team, 'c1');

    expect(notes.map((note) => note.title)).toEqual(['Call', 'Mail']);
    expect(findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ object: 'notes', filter: 'and(id[in]:["n1","n2"])' }),
    );
  });

  it('does not query notes when the company has no targets', async () => {
    const findMany = vi.fn(async () => emptyPage);

    expect(await listCompanyNotes(buildClient({ findMany }), team, 'c1')).toEqual([]);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
});
