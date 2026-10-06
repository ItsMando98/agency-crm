import { isPrivateHostname } from 'src/utils/is-private-hostname.util';

export const normalizeAuditDomain = (input: string): string => {
  const trimmed = input.trim();

  if (trimmed === '') {
    throw new Error('Domain is required');
  }

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;

  try {
    url = new URL(withScheme);
  } catch {
    throw new Error(`"${input}" is not a valid domain or URL`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https URLs can be audited');
  }

  if (url.username !== '' || url.password !== '' || url.port !== '') {
    throw new Error('URLs with credentials or custom ports cannot be audited');
  }

  if (isPrivateHostname(url.hostname)) {
    throw new Error(`"${url.hostname}" is not a public hostname`);
  }

  return url.origin;
};
