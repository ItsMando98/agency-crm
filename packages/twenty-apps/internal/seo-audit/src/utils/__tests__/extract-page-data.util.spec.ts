import { describe, expect, it } from 'vitest';

import { extractPageData } from 'src/utils/extract-page-data.util';

const ORIGIN = 'https://example.com';

const extract = (html: string | null, overrides: { pageUrl?: string; xRobotsTag?: string | null; contentType?: string | null } = {}) =>
  extractPageData({
    html,
    pageUrl: overrides.pageUrl ?? 'https://example.com/services/',
    origin: ORIGIN,
    statusCode: 200,
    responseTimeMs: 120,
    contentType: overrides.contentType === undefined ? 'text/html' : overrides.contentType,
    xRobotsTag: overrides.xRobotsTag ?? null,
  });

const FULL_PAGE = `<!doctype html>
<html lang="de">
<head>
  <title> Sanitär Berlin | Example </title>
  <meta name="description" content="Wir reparieren Rohre.">
  <meta name="viewport" content="width=device-width">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/services/">
  <link rel="stylesheet" href="http://cdn.example.com/a.css">
  <script type="application/ld+json">{"@type":"LocalBusiness"}</script>
  <script>var tracking = "do not count these words";</script>
</head>
<body>
  <h1>Sanitär</h1>
  <p>Wir reparieren Rohre und Heizungen in Berlin.</p>
  <img src="http://example.com/a.jpg" alt="Rohr">
  <img src="/b.jpg">
  <a href="/contact">Kontakt</a>
  <a href="/contact#form">Kontakt 2</a>
  <a href="https://other.com">extern</a>
  <a href="/brochure.pdf">PDF</a>
</body>
</html>`;

describe('extractPageData', () => {
  it('extracts metadata, structure and links from a full page', () => {
    const page = extract(FULL_PAGE);

    expect(page).toMatchObject({
      isHtml: true,
      title: 'Sanitär Berlin | Example',
      metaDescription: 'Wir reparieren Rohre.',
      canonicalUrl: 'https://example.com/services/',
      robotsMeta: 'index, follow',
      isNoindex: false,
      lang: 'de',
      hasViewport: true,
      h1Count: 1,
      imageCount: 2,
      imagesWithoutAlt: 1,
      internalLinks: ['https://example.com/contact'],
      structuredDataTypes: ['LocalBusiness'],
    });
  });

  it('flags insecure resources only on https pages', () => {
    expect(extract(FULL_PAGE).insecureResourceUrls).toEqual([
      'http://example.com/a.jpg',
      'http://cdn.example.com/a.css',
    ]);
    expect(
      extract(FULL_PAGE, { pageUrl: 'http://example.com/services/' }).insecureResourceUrls,
    ).toEqual([]);
  });

  it('counts only visible text, not scripts', () => {
    const page = extract(FULL_PAGE);

    expect(page.textExcerpt).toContain('Wir reparieren Rohre und Heizungen');
    expect(page.textExcerpt).not.toContain('tracking');
    expect(page.wordCount).toBeGreaterThan(5);
  });

  it('detects noindex from the meta tag and the response header', () => {
    expect(
      extract('<html><head><meta name="robots" content="noindex,follow"></head></html>').isNoindex,
    ).toBe(true);
    expect(extract('<html></html>', { xRobotsTag: 'noindex' }).isNoindex).toBe(true);
  });

  it('returns an empty record for non-HTML responses', () => {
    const page = extract('{"a":1}', { contentType: 'application/json' });

    expect(page).toMatchObject({ isHtml: false, title: null, wordCount: 0, internalLinks: [] });
    expect(extract(null).isHtml).toBe(false);
  });

  it('handles pages without any optional tags', () => {
    expect(extract('<html><body>Hello world</body></html>')).toMatchObject({
      title: null,
      metaDescription: null,
      canonicalUrl: null,
      lang: null,
      hasViewport: false,
      h1Count: 0,
      wordCount: 2,
    });
  });
});
