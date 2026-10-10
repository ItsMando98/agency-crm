const HOSTNAME_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

// Returns the origin to audit, or null when the input is not a public website.
export const normalizeDomain = (input: string): string | null => {
  const trimmed = input.trim();

  if (trimmed === '') {
    return null;
  }

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const hostname = url.hostname.toLowerCase();

    if (!HOSTNAME_PATTERN.test(hostname) || url.username !== '' || url.password !== '') {
      return null;
    }

    return `${url.protocol}//${hostname}`;
  } catch {
    return null;
  }
};
