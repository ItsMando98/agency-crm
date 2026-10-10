import { verifyPassword } from '~/lib/auth/password.server';

type AuthenticateParams = { email: string; password: string; ipAddress: string };

type AuthenticateDeps = {
  teamEmails: string[];
  passwordHash: string | undefined;
  isAllowed: (key: string) => boolean;
};

export type AuthenticateResult =
  | { status: 'OK'; email: string }
  | { status: 'INVALID_CREDENTIALS' }
  | { status: 'RATE_LIMITED' }
  | { status: 'NOT_AVAILABLE' };

// A password that matches no stored hash. It is verified when the address is
// unknown, so a wrong address and a wrong password take equally long.
const DECOY_HASH =
  'scrypt:16384:8:1:AAAAAAAAAAAAAAAAAAAAAA:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// Password login for the team. Clients sign in with a link only.
export const authenticateWithPassword = async (
  { email, password, ipAddress }: AuthenticateParams,
  { teamEmails, passwordHash, isAllowed }: AuthenticateDeps,
): Promise<AuthenticateResult> => {
  if (passwordHash === undefined || passwordHash === '') {
    return { status: 'NOT_AVAILABLE' };
  }

  const normalized = email.trim().toLowerCase();

  if (!isAllowed(`password-ip:${ipAddress}`) || !isAllowed(`password-email:${normalized}`)) {
    return { status: 'RATE_LIMITED' };
  }

  const isTeamMember = teamEmails.includes(normalized);
  const isValid = await verifyPassword(password, isTeamMember ? passwordHash : DECOY_HASH);

  return isTeamMember && isValid
    ? { status: 'OK', email: normalized }
    : { status: 'INVALID_CREDENTIALS' };
};
