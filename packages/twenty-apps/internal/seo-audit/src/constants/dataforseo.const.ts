export const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com';
export const DATAFORSEO_REQUEST_TIMEOUT_MS = 45_000;
// DataForSEO lets a Lighthouse run take up to 120 seconds.
export const DATAFORSEO_LIGHTHOUSE_TIMEOUT_MS = 130_000;
export const DATAFORSEO_SUCCESS_STATUS_CODE = 20000;
export const RANKED_KEYWORDS_LIMIT = 500;
export const COMPETITORS_LIMIT = 15;
export const MAX_SHOWN_COMPETITORS = 5;
export const BACKLINK_TARGETS_LIMIT = 40;
export const LOW_BALANCE_THRESHOLD_USD = 1;

export const MARKETS = {
  DE: { locationCode: 2276, languageCode: 'de', countryCode: 'DE', label: 'Germany' },
  AT: { locationCode: 2040, languageCode: 'de', countryCode: 'AT', label: 'Austria' },
  CH: { locationCode: 2756, languageCode: 'de', countryCode: 'CH', label: 'Switzerland' },
  US: { locationCode: 2840, languageCode: 'en', countryCode: 'US', label: 'United States' },
  UK: { locationCode: 2826, languageCode: 'en', countryCode: 'GB', label: 'United Kingdom' },
} as const;

export const DEFAULT_MARKET = 'DE';

// Generic sites that rank for everything and say nothing about the competition.
export const GENERIC_COMPETITOR_DOMAINS = [
  'wikipedia.org',
  'youtube.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'pinterest.com',
  'reddit.com',
  'amazon.com',
  'amazon.de',
  'ebay.com',
  'ebay.de',
  'gutefrage.net',
  'twitter.com',
  'x.com',
  'tiktok.com',
] as const;
