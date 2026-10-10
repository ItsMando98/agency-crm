import { type Principal } from '~/lib/auth/principal';
import { buildFilter } from '~/lib/twenty/build-filter';
import { type TwentyClient } from '~/lib/twenty/twenty-client.server';

const MAX_PORTAL_LOOKUP = 2;

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

// Looks a portal contact up by email. The filter on portalAccess is part of the
// query, so a contact without the flag is never returned. A workspace that does
// not have the field yet answers with an error, which callers treat as no access.
export const findPortalContact = async (
  client: TwentyClient,
  email: string,
): Promise<{ companyId: string | null; personId: string } | null> => {
  const result = await client.findMany({
    object: 'people',
    filter: buildFilter([
      { field: 'emails.primaryEmail', comparator: 'eq', value: email },
      { field: 'portalAccess', comparator: 'eq', value: 'true' },
    ]),
    limit: MAX_PORTAL_LOOKUP,
  });
  const [first] = result.records;

  // Two contacts with one address would be ambiguous, so nobody gets in.
  if (first === undefined || result.records.length > 1) {
    return null;
  }

  const record = first as Record<string, unknown>;
  const personId = asString(record.id);

  return personId === null ? null : { personId, companyId: asString(record.companyId) };
};

export const grantPortalAccess = async (
  client: TwentyClient,
  principal: Principal,
  personId: string,
): Promise<{ email: string } | null> => {
  if (principal.kind === 'CLIENT') {
    return null;
  }

  const person = (await client.findOne({ object: 'people', singular: 'person', id: personId })) as
    | Record<string, unknown>
    | null;
  const emails = person?.emails as Record<string, unknown> | undefined;
  const email = asString(emails?.primaryEmail)?.toLowerCase() ?? null;

  if (person === null || email === null || asString(person.companyId) === null) {
    return null;
  }

  const updated = await client.update({
    object: 'people',
    singular: 'person',
    id: personId,
    data: { portalAccess: true },
  });

  return updated === null ? null : { email };
};

export const revokePortalAccess = async (
  client: TwentyClient,
  principal: Principal,
  personId: string,
): Promise<boolean> => {
  if (principal.kind === 'CLIENT') {
    return false;
  }

  const updated = await client.update({
    object: 'people',
    singular: 'person',
    id: personId,
    data: { portalAccess: false },
  });

  return updated !== null;
};
