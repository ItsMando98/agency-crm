import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { isAuditablePage } from 'src/utils/is-auditable-page.util';

describe('isAuditablePage', () => {
  it('accepts successful and redirected HTML pages', () => {
    expect(isAuditablePage(buildCrawledPage())).toBe(true);
    expect(isAuditablePage(buildCrawledPage({ statusCode: 301 }))).toBe(true);
  });

  it('rejects errors and non-HTML pages', () => {
    expect(isAuditablePage(buildCrawledPage({ statusCode: 404 }))).toBe(false);
    expect(isAuditablePage(buildCrawledPage({ statusCode: 0 }))).toBe(false);
    expect(isAuditablePage(buildCrawledPage({ isHtml: false }))).toBe(false);
  });
});
