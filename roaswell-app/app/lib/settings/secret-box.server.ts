import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const VERSION = 'v1';
const KEY_SALT = 'roaswell-app-settings';

const deriveKey = (secret: string): Buffer => scryptSync(secret, KEY_SALT, KEY_LENGTH);

// Encrypts a value with a key derived from the session secret. A changed
// session secret makes stored values unreadable, which the settings page
// reports as "enter the key again".
export const encryptSecret = (plain: string, secret: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, deriveKey(secret), iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);

  return [VERSION, iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join(':');
};

export const decryptSecret = (stored: string, secret: string): string | null => {
  const [version, iv, tag, data] = stored.split(':');

  if (version !== VERSION || iv === undefined || tag === undefined || data === undefined) {
    return null;
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, deriveKey(secret), Buffer.from(iv, 'base64url'));

    decipher.setAuthTag(Buffer.from(tag, 'base64url'));

    return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
};
