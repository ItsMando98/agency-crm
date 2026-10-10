import { describe, expect, it } from 'vitest';

import { buildLogoutCookie, buildSessionCookie, readCookie, readPrincipal } from '~/lib/auth/session.server';

const SECRET = 'a-secret-that-is-long-enough-for-hmac-signing';
const resolveTeam = async (email: string) =>
  email === 'team@roaswell.com' ? ({ kind: 'TEAM', email } as const) : null;

const cookieHeaderFrom = (setCookie: string) => setCookie.split(';')[0] ?? '';

describe('session', () => {
  it('builds a hardened cookie', () => {
    const cookie = buildSessionCookie({ email: 'team@roaswell.com', secret: SECRET, isSecure: true });

    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('Path=/');
  });

  it('identifies the person from their cookie', async () => {
    const setCookie = buildSessionCookie({ email: 'team@roaswell.com', secret: SECRET, isSecure: false });

    const principal = await readPrincipal({
      cookieHeader: `theme=dark; ${cookieHeaderFrom(setCookie)}`,
      secret: SECRET,
      resolvePrincipal: resolveTeam,
    });

    expect(principal).toEqual({ kind: 'TEAM', email: 'team@roaswell.com' });
  });

  it('ends access once the address is no longer known', async () => {
    const setCookie = buildSessionCookie({ email: 'gone@roaswell.com', secret: SECRET, isSecure: false });

    expect(
      await readPrincipal({ cookieHeader: cookieHeaderFrom(setCookie), secret: SECRET, resolvePrincipal: resolveTeam }),
    ).toBeNull();
  });

  it('has no principal without a valid cookie', async () => {
    expect(await readPrincipal({ cookieHeader: null, secret: SECRET, resolvePrincipal: resolveTeam })).toBeNull();
    expect(
      await readPrincipal({ cookieHeader: 'roaswell_session=garbage', secret: SECRET, resolvePrincipal: resolveTeam }),
    ).toBeNull();
  });

  it('reads one cookie out of several and clears on logout', () => {
    expect(readCookie('a=1; b=two%20words', 'b')).toBe('two words');
    expect(buildLogoutCookie(false)).toContain('Max-Age=0');
  });
});
