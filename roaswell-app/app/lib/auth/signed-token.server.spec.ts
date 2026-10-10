import { describe, expect, it } from 'vitest';

import { signToken, verifyToken } from '~/lib/auth/signed-token.server';

const SECRET = 'a-secret-that-is-long-enough-for-hmac-signing';
const NOW = new Date('2026-10-10T10:00:00Z');

describe('signed token', () => {
  it('returns the subject for a valid token', () => {
    const token = signToken({ subject: 'team@roaswell.com', purpose: 'session', ttlSeconds: 60, secret: SECRET, now: NOW });

    expect(verifyToken({ token, purpose: 'session', secret: SECRET, now: NOW })).toEqual({
      subject: 'team@roaswell.com',
    });
  });

  it('rejects an expired token', () => {
    const token = signToken({ subject: 'a@b.de', purpose: 'session', ttlSeconds: 60, secret: SECRET, now: NOW });
    const later = new Date(NOW.getTime() + 61_000);

    expect(verifyToken({ token, purpose: 'session', secret: SECRET, now: later })).toBeNull();
  });

  it('rejects a token signed with another secret', () => {
    const token = signToken({ subject: 'a@b.de', purpose: 'session', ttlSeconds: 60, secret: 'another-secret-with-enough-length-1234', now: NOW });

    expect(verifyToken({ token, purpose: 'session', secret: SECRET, now: NOW })).toBeNull();
  });

  it('rejects a changed payload', () => {
    const token = signToken({ subject: 'a@b.de', purpose: 'session', ttlSeconds: 60, secret: SECRET, now: NOW });
    const [, signature] = token.split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({ sub: 'boss@roaswell.com', pur: 'session', exp: 9_999_999_999 }),
    ).toString('base64url');

    expect(verifyToken({ token: `${forgedPayload}.${signature}`, purpose: 'session', secret: SECRET, now: NOW })).toBeNull();
  });

  it('does not accept a login link as a session', () => {
    const token = signToken({ subject: 'a@b.de', purpose: 'magic-link', ttlSeconds: 60, secret: SECRET, now: NOW });

    expect(verifyToken({ token, purpose: 'session', secret: SECRET, now: NOW })).toBeNull();
  });

  it.each(['', 'abc', 'a.b.c', '.'])('rejects the malformed token %j', (token) => {
    expect(verifyToken({ token, purpose: 'session', secret: SECRET, now: NOW })).toBeNull();
  });
});
