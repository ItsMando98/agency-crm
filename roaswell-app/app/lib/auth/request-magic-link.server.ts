import { type Principal } from '~/lib/auth/principal';
import { signToken } from '~/lib/auth/signed-token.server';

const MAGIC_LINK_TTL_SECONDS = 15 * 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RequestMagicLinkDeps = {
  resolvePrincipal: (email: string) => Promise<Principal | null>;
  sendMail: (params: { to: string; link: string }) => Promise<void>;
  isAllowed: (key: string) => boolean;
  secret: string;
  appUrl: string;
  now?: Date;
};

export type RequestMagicLinkResult =
  | { status: 'SENT_OR_IGNORED' }
  | { status: 'INVALID_EMAIL' }
  | { status: 'RATE_LIMITED' };

// The answer is the same for known and unknown addresses, so the form cannot be
// used to find out who has an account.
export const requestMagicLink = async (
  { email, ipAddress }: { email: string; ipAddress: string },
  deps: RequestMagicLinkDeps,
): Promise<RequestMagicLinkResult> => {
  const normalized = email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalized)) {
    return { status: 'INVALID_EMAIL' };
  }

  if (!deps.isAllowed(`email:${normalized}`) || !deps.isAllowed(`ip:${ipAddress}`)) {
    return { status: 'RATE_LIMITED' };
  }

  const principal = await deps.resolvePrincipal(normalized);

  if (principal === null) {
    return { status: 'SENT_OR_IGNORED' };
  }

  const token = signToken({
    subject: normalized,
    purpose: 'magic-link',
    ttlSeconds: MAGIC_LINK_TTL_SECONDS,
    secret: deps.secret,
    now: deps.now,
  });
  const link = `${deps.appUrl.replace(/\/+$/, '')}/auth/verify?token=${encodeURIComponent(token)}`;

  await deps.sendMail({ to: normalized, link });

  return { status: 'SENT_OR_IGNORED' };
};
