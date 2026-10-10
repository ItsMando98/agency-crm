import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MIN_PASSWORD_LENGTH = 12;
const FORMAT = 'scrypt';

// Format: scrypt:<cost>:<blockSize>:<parallelism>:<salt>:<hash>, no `$`, so the
// value survives a variable file untouched.
export const hashPassword = async (password: string): Promise<string> => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`The password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
  });

  return [
    FORMAT,
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString('base64url'),
    hash.toString('base64url'),
  ].join(':');
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [format, cost, blockSize, parallelism, salt, hash] = stored.split(':');

  if (
    format !== FORMAT ||
    cost === undefined ||
    blockSize === undefined ||
    parallelism === undefined ||
    salt === undefined ||
    hash === undefined
  ) {
    return false;
  }

  const expected = Buffer.from(hash, 'base64url');
  const options = { N: Number(cost), r: Number(blockSize), p: Number(parallelism) };

  if (expected.length === 0 || !Object.values(options).every(Number.isInteger)) {
    return false;
  }

  try {
    const actual = await scryptAsync(
      password,
      Buffer.from(salt, 'base64url'),
      expected.length,
      options,
    );

    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
};
