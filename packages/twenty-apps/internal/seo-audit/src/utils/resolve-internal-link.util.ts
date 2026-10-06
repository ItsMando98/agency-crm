import { NON_HTML_EXTENSIONS } from 'src/constants/crawl.const';

const TRACKING_PARAMETER_PATTERN = /^(utm_|fbclid$|gclid$|mc_)/i;

const stripWww = (hostname: string): string => hostname.replace(/^www\./, '');

export const resolveInternalLink = (
  href: string,
  baseUrl: string,
  origin: string,
): string | null => {
  const trimmed = href.trim();

  if (trimmed === '' || trimmed.startsWith('#')) {
    return null;
  }

  let target: URL;
  const siteUrl = new URL(origin);

  try {
    target = new URL(trimmed, baseUrl);
  } catch {
    return null;
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return null;
  }

  if (stripWww(target.hostname) !== stripWww(siteUrl.hostname)) {
    return null;
  }

  const extension = target.pathname.split('.').pop()?.toLowerCase();

  if (
    target.pathname.includes('.') &&
    extension !== undefined &&
    (NON_HTML_EXTENSIONS as readonly string[]).includes(extension)
  ) {
    return null;
  }

  target.hash = '';
  target.host = siteUrl.host;

  for (const key of [...target.searchParams.keys()]) {
    if (TRACKING_PARAMETER_PATTERN.test(key)) {
      target.searchParams.delete(key);
    }
  }

  return target.toString();
};
