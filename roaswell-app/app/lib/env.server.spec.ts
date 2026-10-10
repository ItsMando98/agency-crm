import { describe, expect, it } from 'vitest';

import { getEnv } from '~/lib/env.server';

const base = {
  TWENTY_API_KEY: 'key',
  SESSION_SECRET: 'a-secret-that-is-long-enough-for-hmac-signing',
  TEAM_EMAILS: ' Team@Roaswell.com , second@roaswell.com ',
};

describe('getEnv', () => {
  it('normalizes the team addresses', () => {
    expect(getEnv(base).TEAM_EMAILS).toEqual(['team@roaswell.com', 'second@roaswell.com']);
  });

  it('treats empty optional values like unset ones', () => {
    const env = getEnv({ ...base, SMTP_HOST: '', SMTP_PORT: '', SMTP_USER: ' ', TEAM_PASSWORD_HASH: '' });

    expect(env.SMTP_HOST).toBeUndefined();
    expect(env.SMTP_PORT).toBe(587);
    expect(env.SMTP_USER).toBeUndefined();
    expect(env.TEAM_PASSWORD_HASH).toBeUndefined();
  });

  it('names the missing variables instead of printing values', () => {
    expect(() => getEnv({ TEAM_EMAILS: 'a@b.de' })).toThrow(/TWENTY_API_KEY.*SESSION_SECRET/);
  });

  it('rejects a short session secret', () => {
    expect(() => getEnv({ ...base, SESSION_SECRET: 'short' })).toThrow(/SESSION_SECRET/);
  });
});
