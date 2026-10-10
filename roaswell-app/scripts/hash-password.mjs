// Reads a password from stdin and prints its hash. Same format as
// app/lib/auth/password.server.ts, so the server can verify it.
import { randomBytes, scryptSync } from 'node:crypto';

const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 12;

let input = '';

for await (const chunk of process.stdin) {
  input += chunk;
}

const password = input.replace(/\r?\n$/, '');

if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`The password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, KEY_LENGTH, { N: COST, r: BLOCK_SIZE, p: PARALLELISM });

console.log(
  ['scrypt', COST, BLOCK_SIZE, PARALLELISM, salt.toString('base64url'), hash.toString('base64url')].join(':'),
);
