import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from '~/lib/auth/password.server';

describe('password hashing', () => {
  it('accepts the right password and rejects a wrong one', async () => {
    const stored = await hashPassword('correct horse battery');

    expect(await verifyPassword('correct horse battery', stored)).toBe(true);
    expect(await verifyPassword('correct horse batterz', stored)).toBe(false);
    expect(await verifyPassword('', stored)).toBe(false);
  });

  it('salts every hash and avoids characters a variable file would expand', async () => {
    const first = await hashPassword('correct horse battery');
    const second = await hashPassword('correct horse battery');

    expect(first).not.toBe(second);
    expect(first).not.toContain('$');
    expect(first.startsWith('scrypt:16384:8:1:')).toBe(true);
  });

  it('refuses a short password', async () => {
    await expect(hashPassword('short')).rejects.toThrow(/at least 12/);
  });

  it.each(['', 'plain', 'scrypt:1:2', 'bcrypt:1:2:3:4:5', 'scrypt:x:8:1:abc:def'])(
    'does not verify against the malformed hash %j',
    async (stored) => {
      expect(await verifyPassword('correct horse battery', stored)).toBe(false);
    },
  );

  it('verifies a hash made by the server script', async () => {
    const stored = execFileSync('node', ['scripts/hash-password.mjs'], {
      input: 'a long enough password',
      encoding: 'utf8',
    }).trim();

    expect(await verifyPassword('a long enough password', stored)).toBe(true);
    expect(await verifyPassword('another long password', stored)).toBe(false);
  });
});
