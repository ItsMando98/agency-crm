import { type Principal } from '~/lib/auth/principal';
import { signToken, verifyToken } from '~/lib/auth/signed-token.server';

export const SESSION_COOKIE_NAME = 'roaswell_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export const readCookie = (header: string | null, name: string): string | null => {
  if (header === null) {
    return null;
  }

  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');

    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
};

export const buildSessionCookie = ({
  email,
  secret,
  isSecure,
  now,
}: {
  email: string;
  secret: string;
  isSecure: boolean;
  now?: Date;
}): string => {
  const token = signToken({
    subject: email,
    purpose: 'session',
    ttlSeconds: SESSION_TTL_SECONDS,
    secret,
    now,
  });

  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
    ...(isSecure ? ['Secure'] : []),
  ].join('; ');
};

export const buildLogoutCookie = (isSecure: boolean): string =>
  [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    ...(isSecure ? ['Secure'] : []),
  ].join('; ');

// Reads the session and looks the person up again on every request, so
// removing an address from the allow list ends their access immediately.
export const readPrincipal = async ({
  cookieHeader,
  secret,
  resolvePrincipal,
  now,
}: {
  cookieHeader: string | null;
  secret: string;
  resolvePrincipal: (email: string) => Promise<Principal | null>;
  now?: Date;
}): Promise<Principal | null> => {
  const token = readCookie(cookieHeader, SESSION_COOKIE_NAME);

  if (token === null) {
    return null;
  }

  const verified = verifyToken({ token, purpose: 'session', secret, now });

  return verified === null ? null : resolvePrincipal(verified.subject);
};
