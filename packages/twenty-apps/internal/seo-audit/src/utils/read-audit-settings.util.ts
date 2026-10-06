import {
  DEFAULT_LANGUAGE_VARIABLE_KEY,
  MARKET_VARIABLE_KEY,
  MAX_PAGES_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { MAX_CRAWLED_PAGES } from 'src/constants/crawl.const';
import { DEFAULT_MARKET, MARKETS } from 'src/constants/dataforseo.const';
import { SEO_AUDIT_LANGUAGE } from 'src/constants/seo-audit.constants';
import { type AuditLanguage } from 'src/types/audit-language';
import { type Market } from 'src/types/market';

type AuditSettings = {
  defaultLanguage: AuditLanguage;
  maxPages: number;
  market: Market;
};

export const readAuditSettings = (
  environment: Record<string, string | undefined> = process.env,
): AuditSettings => {
  const language = environment[DEFAULT_LANGUAGE_VARIABLE_KEY]?.trim();
  const maxPages = Number(environment[MAX_PAGES_VARIABLE_KEY]);
  const market = environment[MARKET_VARIABLE_KEY]?.trim() ?? '';

  return {
    defaultLanguage:
      language === SEO_AUDIT_LANGUAGE.EN
        ? SEO_AUDIT_LANGUAGE.EN
        : SEO_AUDIT_LANGUAGE.DE,
    maxPages:
      Number.isFinite(maxPages) && maxPages >= 1
        ? Math.min(Math.floor(maxPages), MAX_CRAWLED_PAGES)
        : MAX_CRAWLED_PAGES,
    market: Object.keys(MARKETS).includes(market)
      ? (market as Market)
      : DEFAULT_MARKET,
  };
};
