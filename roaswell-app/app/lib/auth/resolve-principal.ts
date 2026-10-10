import { type Principal } from '~/lib/auth/principal';

type PortalContact = { companyId: string | null };

type ResolvePrincipalDeps = {
  teamEmails: string[];
  findPortalContact: (email: string) => Promise<PortalContact | null>;
};

// Team members come from the allow list. A client is a contact with portal
// access and a company: without a company there is nothing they could see, so
// they are refused instead of getting an unscoped view.
export const resolvePrincipalFromDirectory = async (
  rawEmail: string,
  { teamEmails, findPortalContact }: ResolvePrincipalDeps,
): Promise<Principal | null> => {
  const email = rawEmail.trim().toLowerCase();

  if (email === '') {
    return null;
  }

  if (teamEmails.includes(email)) {
    return { kind: 'TEAM', email };
  }

  try {
    const contact = await findPortalContact(email);

    return contact?.companyId === null || contact === null
      ? null
      : { kind: 'CLIENT', email, companyId: contact.companyId };
  } catch {
    // A directory outage must never turn into access.
    return null;
  }
};
