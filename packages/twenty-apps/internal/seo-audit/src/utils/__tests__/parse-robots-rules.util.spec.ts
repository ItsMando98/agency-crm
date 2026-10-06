import { describe, expect, it } from 'vitest';

import { parseRobotsRules } from 'src/utils/parse-robots-rules.util';

describe('parseRobotsRules', () => {
  it('uses the wildcard group and collects sitemaps', () => {
    const rules = parseRobotsRules(`
      # comment
      User-agent: *
      Disallow: /admin
      Allow: /admin/public
      Disallow:
      Sitemap: https://example.com/sitemap.xml
    `);

    expect(rules).toEqual({
      allowRules: ['/admin/public'],
      disallowRules: ['/admin'],
      sitemapUrls: ['https://example.com/sitemap.xml'],
    });
  });

  it('prefers a group addressed to the audit bot', () => {
    const rules = parseRobotsRules(`
      User-agent: *
      Disallow: /
      User-agent: TwentySeoAuditBot
      Disallow: /private
    `);

    expect(rules.disallowRules).toEqual(['/private']);
  });

  it('shares rules between consecutive user-agent lines', () => {
    const rules = parseRobotsRules(`
      User-agent: googlebot
      User-agent: *
      Disallow: /tmp
    `);

    expect(rules.disallowRules).toEqual(['/tmp']);
  });

  it('returns empty rules for an empty file', () => {
    expect(parseRobotsRules('')).toEqual({
      allowRules: [],
      disallowRules: [],
      sitemapUrls: [],
    });
  });
});
