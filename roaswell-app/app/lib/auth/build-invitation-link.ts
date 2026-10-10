import { signToken } from '~/lib/auth/signed-token.server';

const INVITATION_TTL_SECONDS = 7 * 24 * 60 * 60;

export const buildInvitationLink = ({
  email,
  secret,
  appUrl,
  now,
}: {
  email: string;
  secret: string;
  appUrl: string;
  now?: Date;
}): string => {
  const token = signToken({
    subject: email.trim().toLowerCase(),
    purpose: 'magic-link',
    ttlSeconds: INVITATION_TTL_SECONDS,
    secret,
    now,
  });

  return `${appUrl.replace(/\/+$/, '')}/auth/verify?token=${encodeURIComponent(token)}`;
};
