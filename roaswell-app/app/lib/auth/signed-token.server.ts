import { createHmac, timingSafeEqual } from 'node:crypto';

export type TokenPurpose = 'session' | 'magic-link';

type SignTokenParams = {
  subject: string;
  purpose: TokenPurpose;
  ttlSeconds: number;
  secret: string;
  now?: Date;
};

type VerifyTokenParams = {
  token: string;
  purpose: TokenPurpose;
  secret: string;
  now?: Date;
};

const MILLISECONDS_PER_SECOND = 1000;

const computeSignature = (payload: string, secret: string): Buffer =>
  createHmac('sha256', secret).update(payload).digest();

export const signToken = ({
  subject,
  purpose,
  ttlSeconds,
  secret,
  now = new Date(),
}: SignTokenParams): string => {
  const expiresAt = Math.floor(now.getTime() / MILLISECONDS_PER_SECOND) + ttlSeconds;
  const payload = Buffer.from(
    JSON.stringify({ sub: subject, pur: purpose, exp: expiresAt }),
  ).toString('base64url');

  return `${payload}.${computeSignature(payload, secret).toString('base64url')}`;
};

export const verifyToken = ({
  token,
  purpose,
  secret,
  now = new Date(),
}: VerifyTokenParams): { subject: string } | null => {
  const parts = token.split('.');

  if (parts.length !== 2) {
    return null;
  }

  const [payload, signature] = parts as [string, string];
  const expected = computeSignature(payload, secret);
  const provided = Buffer.from(signature, 'base64url');

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const claims: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    if (typeof claims !== 'object' || claims === null) {
      return null;
    }

    const { sub, pur, exp } = claims as Record<string, unknown>;
    const nowSeconds = Math.floor(now.getTime() / MILLISECONDS_PER_SECOND);

    if (
      typeof sub !== 'string' ||
      pur !== purpose ||
      typeof exp !== 'number' ||
      exp <= nowSeconds
    ) {
      return null;
    }

    return { subject: sub };
  } catch {
    return null;
  }
};
