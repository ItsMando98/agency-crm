import { describe, expect, it, vi } from 'vitest';

import { requestMagicLink } from '~/lib/auth/request-magic-link.server';
import { verifyToken } from '~/lib/auth/signed-token.server';

const SECRET = 'a-secret-that-is-long-enough-for-hmac-signing';

const buildDeps = (overrides: Partial<Parameters<typeof requestMagicLink>[1]> = {}) => ({
  resolvePrincipal: vi.fn(async (email: string) => ({ kind: 'TEAM' as const, email })),
  sendMail: vi.fn(async () => undefined),
  isAllowed: vi.fn(() => true),
  secret: SECRET,
  appUrl: 'https://app.roaswell.com/',
  ...overrides,
});

describe('requestMagicLink', () => {
  it('mails a link with a login token to a known address', async () => {
    const deps = buildDeps();

    const result = await requestMagicLink({ email: ' Team@Roaswell.com ', ipAddress: '1.1.1.1' }, deps);

    expect(result).toEqual({ status: 'SENT_OR_IGNORED' });
    const { to, link } = vi.mocked(deps.sendMail).mock.calls[0]![0];
    const token = new URL(link).searchParams.get('token') ?? '';

    expect(to).toBe('team@roaswell.com');
    expect(link.startsWith('https://app.roaswell.com/auth/verify?token=')).toBe(true);
    expect(verifyToken({ token, purpose: 'magic-link', secret: SECRET })).toEqual({ subject: 'team@roaswell.com' });
  });

  it('answers the same for an unknown address and sends nothing', async () => {
    const deps = buildDeps({ resolvePrincipal: vi.fn(async () => null) });

    const result = await requestMagicLink({ email: 'nobody@example.com', ipAddress: '1.1.1.1' }, deps);

    expect(result).toEqual({ status: 'SENT_OR_IGNORED' });
    expect(deps.sendMail).not.toHaveBeenCalled();
  });

  it('rejects text that is not an email address', async () => {
    const deps = buildDeps();

    expect(await requestMagicLink({ email: 'not-an-email', ipAddress: '1.1.1.1' }, deps)).toEqual({
      status: 'INVALID_EMAIL',
    });
  });

  it('stops when the throttle says no, before looking the address up', async () => {
    const deps = buildDeps({ isAllowed: vi.fn(() => false) });

    const result = await requestMagicLink({ email: 'team@roaswell.com', ipAddress: '1.1.1.1' }, deps);

    expect(result).toEqual({ status: 'RATE_LIMITED' });
    expect(deps.resolvePrincipal).not.toHaveBeenCalled();
  });
});
