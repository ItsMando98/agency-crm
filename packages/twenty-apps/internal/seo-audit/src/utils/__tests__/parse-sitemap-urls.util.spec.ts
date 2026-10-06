import { describe, expect, it } from 'vitest';

import { parseSitemapUrls } from 'src/utils/parse-sitemap-urls.util';

describe('parseSitemapUrls', () => {
  it('reads page URLs from a urlset', () => {
    const xml = `<urlset><url><loc>https://example.com/</loc></url><url><loc> https://example.com/a </loc></url></urlset>`;

    expect(parseSitemapUrls(xml)).toEqual({
      pageUrls: ['https://example.com/', 'https://example.com/a'],
      sitemapUrls: [],
    });
  });

  it('reads nested sitemaps from a sitemap index', () => {
    const xml = `<sitemapindex><sitemap><loc>https://example.com/s1.xml</loc></sitemap></sitemapindex>`;

    expect(parseSitemapUrls(xml)).toEqual({
      pageUrls: [],
      sitemapUrls: ['https://example.com/s1.xml'],
    });
  });

  it('understands CDATA and returns nothing for other content', () => {
    expect(
      parseSitemapUrls('<urlset><url><loc><![CDATA[https://example.com/x]]></loc></url></urlset>')
        .pageUrls,
    ).toEqual(['https://example.com/x']);
    expect(parseSitemapUrls('<html></html>')).toEqual({ pageUrls: [], sitemapUrls: [] });
  });
});
