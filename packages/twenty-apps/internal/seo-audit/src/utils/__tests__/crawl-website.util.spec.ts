import { describe, expect, it } from 'vitest';

import { createFakeFetch } from 'src/__mocks__/create-fake-fetch.mock';
import { crawlWebsite } from 'src/utils/crawl-website.util';

const page = (title: string, links: string[]) =>
  `<html lang="en"><head><title>${title} page title</title></head><body><h1>${title}</h1>${links
    .map((href) => `<a href="${href}">link</a>`)
    .join('')}</body></html>`;

const SITE = {
  'https://example.com/': { body: page('Home', ['/about', '/gone', '/private/area']) },
  'https://example.com/about': { body: page('About', ['/team']) },
  'https://example.com/team': { body: page('Team', []) },
  'https://example.com/from-sitemap': { body: page('Sitemap only', []) },
  'https://example.com/gone': { status: 404, body: 'missing' },
  'https://example.com/robots.txt': {
    contentType: 'text/plain',
    body: 'User-agent: *\nDisallow: /private\nSitemap: https://example.com/sitemap.xml',
  },
  'https://example.com/sitemap.xml': {
    contentType: 'application/xml',
    body: '<urlset><url><loc>https://example.com/from-sitemap</loc></url></urlset>',
  },
};

describe('crawlWebsite', () => {
  it('crawls linked pages and sitemap URLs and skips robots-blocked paths', async () => {
    const result = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: createFakeFetch(SITE),
    });

    expect(result.pages.map((crawledPage) => crawledPage.url).sort()).toEqual([
      'https://example.com/',
      'https://example.com/about',
      'https://example.com/from-sitemap',
      'https://example.com/gone',
      'https://example.com/team',
    ]);
    expect(result.robotsTxtFound).toBe(true);
    expect(result.sitemapFound).toBe(true);
    expect(result.blockedByRobotsCount).toBe(1);
  });

  it('records the status of every linked target', async () => {
    const result = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: createFakeFetch(SITE),
    });

    expect(result.linkTargetStatusCodes['https://example.com/gone']).toBe(404);
    expect(result.linksByPage['https://example.com/']).toContain('https://example.com/gone');
  });

  it('checks link targets beyond the page limit with HEAD requests', async () => {
    const result = await crawlWebsite({
      origin: 'https://example.com',
      maxPages: 1,
      fetchImplementation: createFakeFetch(SITE),
    });

    expect(result.pages).toHaveLength(1);
    expect(result.linkTargetStatusCodes['https://example.com/about']).toBe(200);
    expect(result.linkTargetStatusCodes['https://example.com/gone']).toBe(404);
  });

  it('reports a missing robots.txt and sitemap', async () => {
    const result = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: createFakeFetch({
        'https://example.com/': { body: page('Home', []) },
      }),
    });

    expect(result.robotsTxtFound).toBe(false);
    expect(result.sitemapFound).toBe(false);
  });

  it('keeps the robots.txt content so the AI crawler rules can be read from it', async () => {
    const result = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: createFakeFetch(SITE),
    });

    expect(result.robotsTxt).toContain('Disallow: /private');
  });

  it('finds an llms.txt and ignores an HTML error page served in its place', async () => {
    const withLlmsTxt = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: createFakeFetch({
        ...SITE,
        'https://example.com/llms.txt': { contentType: 'text/plain', body: '# Example\n> About us' },
      }),
    });
    const withErrorPage = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: createFakeFetch({
        ...SITE,
        'https://example.com/llms.txt': { contentType: 'text/html', body: '<html>Not found</html>' },
      }),
    });
    const withEmptyFile = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: createFakeFetch({
        ...SITE,
        'https://example.com/llms.txt': { contentType: 'text/plain', body: '  \n' },
      }),
    });

    expect(withLlmsTxt.llmsTxtFound).toBe(true);
    expect(withErrorPage.llmsTxtFound).toBe(false);
    expect(withEmptyFile.llmsTxtFound).toBe(false);
  });

  it('reports no robots.txt content and no llms.txt for a bare site', async () => {
    const result = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: createFakeFetch({ 'https://example.com/': { body: page('Home', []) } }),
    });

    expect(result.robotsTxt).toBeNull();
    expect(result.llmsTxtFound).toBe(false);
  });

  it('follows the homepage redirect to the canonical origin', async () => {
    const result = await crawlWebsite({
      origin: 'http://example.com',
      fetchImplementation: createFakeFetch({
        'http://example.com/': { status: 301, headers: { location: 'https://www.example.com/' } },
        'https://www.example.com/': { body: page('Home', []) },
      }),
    });

    expect(result.origin).toBe('https://www.example.com');
    expect(result.pages[0].url).toBe('https://www.example.com/');
  });

  it('fails when the homepage is not reachable', async () => {
    await expect(
      crawlWebsite({
        origin: 'https://example.com',
        fetchImplementation: createFakeFetch({ 'https://example.com/': { status: 503 } }),
      }),
    ).rejects.toThrow('Homepage is not reachable');
  });
});

describe('crawlWebsite redirects', () => {
  const redirectSite = createFakeFetch({
    'https://example.com/': { body: page('Home', ['/old', '/new']) },
    'https://example.com/old': { status: 301, headers: { location: '/new' } },
    'https://example.com/new': { body: page('New', []) },
  });

  it('counts a redirect target once and keeps the requested URL status', async () => {
    const result = await crawlWebsite({
      origin: 'https://example.com',
      fetchImplementation: redirectSite,
    });

    expect(result.pages.map((crawledPage) => crawledPage.url).sort()).toEqual([
      'https://example.com/',
      'https://example.com/new',
    ]);
    expect(result.linkTargetStatusCodes['https://example.com/old']).toBe(200);
  });
});
