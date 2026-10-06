import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { checkOnPage } from 'src/utils/check-on-page.util';

const ruleIds = (findings: ReturnType<typeof checkOnPage>) =>
  findings.map((finding) => finding.ruleId).sort();

describe('checkOnPage', () => {
  it('returns no findings for a clean page', () => {
    expect(checkOnPage([buildCrawledPage()])).toEqual([]);
  });

  it('flags missing, short and long titles and descriptions', () => {
    const findings = checkOnPage([
      buildCrawledPage({ url: 'https://example.com/a', title: null, metaDescription: null }),
      buildCrawledPage({ url: 'https://example.com/b', title: 'Short', metaDescription: 'x'.repeat(200) }),
      buildCrawledPage({ url: 'https://example.com/c', title: 'T'.repeat(80) }),
    ]);

    expect(ruleIds(findings)).toEqual([
      'DESCRIPTION_MISSING',
      'DESCRIPTION_TOO_LONG',
      'TITLE_MISSING',
      'TITLE_TOO_LONG',
      'TITLE_TOO_SHORT',
    ]);
    expect(findings.find((finding) => finding.ruleId === 'TITLE_MISSING')?.affectedUrls).toEqual([
      'https://example.com/a',
    ]);
  });

  it('flags duplicate titles and descriptions', () => {
    const findings = checkOnPage([
      buildCrawledPage({ url: 'https://example.com/a', title: 'Same long enough title', metaDescription: 'Same' }),
      buildCrawledPage({ url: 'https://example.com/b', title: 'Same long enough title', metaDescription: 'Same' }),
    ]);

    expect(ruleIds(findings)).toEqual(['DESCRIPTION_DUPLICATE', 'TITLE_DUPLICATE']);
  });

  it('flags heading, language, canonical and alt text problems', () => {
    const findings = checkOnPage([
      buildCrawledPage({ url: 'https://example.com/a', title: 'Distinct title for page A', metaDescription: 'Description A', h1Count: 0, lang: null, canonicalUrl: null, imagesWithoutAlt: 3 }),
      buildCrawledPage({ url: 'https://example.com/b', title: 'Distinct title for page B', metaDescription: 'Description B', h1Count: 2 }),
    ]);

    expect(ruleIds(findings)).toEqual([
      'CANONICAL_MISSING',
      'H1_MISSING',
      'H1_MULTIPLE',
      'IMAGES_WITHOUT_ALT',
      'LANG_MISSING',
    ]);
  });

  it('ignores error pages and non-HTML pages', () => {
    expect(
      checkOnPage([
        buildCrawledPage({ statusCode: 404, title: null }),
        buildCrawledPage({ isHtml: false, title: null }),
      ]),
    ).toEqual([]);
  });
});
