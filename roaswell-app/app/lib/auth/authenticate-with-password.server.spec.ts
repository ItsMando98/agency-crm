import { beforeAll, describe, expect, it, vi } from 'vitest';

import { authenticateWithPassword } from '~/lib/auth/authenticate-with-password.server';
import { hashPassword } from '~/lib/auth/password.server';

let passwordHash = '';

beforeAll(async () => {
  passwordHash = await hashPassword('correct horse battery');
});

const deps = (overrides: Partial<Parameters<typeof authenticateWithPassword>[1]> = {}) => ({
  teamEmails: ['team@roaswell.com'],
  passwordHash,
  isAllowed: () => true,
  ...overrides,
});

describe('authenticateWithPassword', () => {
  it('signs a team member in with the right password', async () => {
    expect(
      await authenticateWithPassword(
        { email: ' Team@Roaswell.com ', password: 'correct horse battery', ipAddress: '1.1.1.1' },
        deps(),
      ),
    ).toEqual({ status: 'OK', email: 'team@roaswell.com' });
  });

  it('answers the same for a wrong password and an unknown address', async () => {
    const wrongPassword = await authenticateWithPassword(
      { email: 'team@roaswell.com', password: 'wrong password here', ipAddress: '1.1.1.1' },
      deps(),
    );
    const unknownAddress = await authenticateWithPassword(
      { email: 'nobody@example.com', password: 'correct horse battery', ipAddress: '1.1.1.1' },
      deps(),
    );

    expect(wrongPassword).toEqual({ status: 'INVALID_CREDENTIALS' });
    expect(unknownAddress).toEqual({ status: 'INVALID_CREDENTIALS' });
  });

  it('is not available when no password is configured', async () => {
    expect(
      await authenticateWithPassword(
        { email: 'team@roaswell.com', password: 'correct horse battery', ipAddress: '1.1.1.1' },
        deps({ passwordHash: undefined }),
      ),
    ).toEqual({ status: 'NOT_AVAILABLE' });
  });

  it('stops before checking anything when the throttle says no', async () => {
    const isAllowed = vi.fn(() => false);

    expect(
      await authenticateWithPassword(
        { email: 'team@roaswell.com', password: 'correct horse battery', ipAddress: '1.1.1.1' },
        deps({ isAllowed }),
      ),
    ).toEqual({ status: 'RATE_LIMITED' });
  });
});
