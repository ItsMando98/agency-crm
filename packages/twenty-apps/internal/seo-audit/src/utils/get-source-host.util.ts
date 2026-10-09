const WWW_PREFIX = 'www.';

export const getSourceHost = (url: string): string | null => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const host = hostname.startsWith(WWW_PREFIX)
      ? hostname.slice(WWW_PREFIX.length)
      : hostname;

    return host === '' ? null : host;
  } catch {
    return null;
  }
};

export const isSameOrSubdomain = (host: string, domain: string): boolean =>
  host === domain || host.endsWith(`.${domain}`);
