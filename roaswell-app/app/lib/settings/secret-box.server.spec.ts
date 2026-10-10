import { describe, expect, it } from 'vitest';

import { decryptSecret, encryptSecret } from '~/lib/settings/secret-box.server';

const SECRET = 'a-secret-that-is-long-enough-for-hmac-signing';

describe('secret box', () => {
  it('returns the value it encrypted and never stores it in plain text', () => {
    const stored = encryptSecret('re_abc123SECRET', SECRET);

    expect(stored).not.toContain('re_abc123SECRET');
    expect(decryptSecret(stored, SECRET)).toBe('re_abc123SECRET');
  });

  it('uses a fresh nonce for every value', () => {
    expect(encryptSecret('same', SECRET)).not.toBe(encryptSecret('same', SECRET));
  });

  it('cannot be read with another secret or after tampering', () => {
    const stored = encryptSecret('re_abc123SECRET', SECRET);
    const [version, iv, tag, data] = stored.split(':');
    const flipped = `${version}:${iv}:${tag}:${data?.slice(0, -2)}AA`;

    expect(decryptSecret(stored, 'another-secret-with-enough-length-1234')).toBeNull();
    expect(decryptSecret(flipped, SECRET)).toBeNull();
    expect(decryptSecret('garbage', SECRET)).toBeNull();
  });
});
