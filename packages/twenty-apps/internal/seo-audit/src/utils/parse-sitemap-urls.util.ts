type ParsedSitemap = {
  pageUrls: string[];
  sitemapUrls: string[];
};

const LOCATION_PATTERN = /<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/gi;

export const parseSitemapUrls = (xml: string): ParsedSitemap => {
  const locations = [...xml.matchAll(LOCATION_PATTERN)].map(
    (match) => match[1],
  );

  return xml.includes('<sitemapindex')
    ? { pageUrls: [], sitemapUrls: locations }
    : { pageUrls: locations, sitemapUrls: [] };
};
