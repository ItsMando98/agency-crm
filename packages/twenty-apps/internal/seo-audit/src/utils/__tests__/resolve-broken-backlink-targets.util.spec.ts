import { describe, expect, it } from 'vitest';

import { createFakeFetch } from 'src/__mocks__/create-fake-fetch.mock';
import { resolveBrokenBacklinkTargets } from 'src/utils/resolve-broken-backlink-targets.util';

const crawlResult = {
  origin: 'https://example.com',
  linkTargetStatusCodes: {
    'https://example.com/known-ok': 200,
    'https://example.com/known-gone': 404,
  },
};

const target = (url: string, backlinks = 3) => ({ url, backlinks, referringDomains: 1 });

describe('resolveBrokenBacklinkTargets', () => {
  it('reuses statuses from the crawl and checks the rest with HEAD', async () => {
    const broken = await resolveBrokenBacklinkTargets({
      targets: [
        target('https://example.com/known-ok'),
        target('https://example.com/known-gone', 31),
        target('https://example.com/unknown-gone'),
        target('https://example.com/unknown-ok'),
      ],
      crawlResult,
      fetchImplementation: createFakeFetch({
        'https://example.com/unknown-ok': { status: 200 },
        'https://example.com/unknown-gone': { status: 410 },
      }),
    });

    expect(broken.map((entry) => entry.url).sort()).toEqual([
      'https://example.com/known-gone',
      'https://example.com/unknown-gone',
    ]);
    expect(broken.find((entry) => entry.url.endsWith('known-gone'))?.backlinks).toBe(31);
  });

  it('ignores targets on other domains and files that are not pages', async () => {
    const broken = await resolveBrokenBacklinkTargets({
      targets: [target('https://other.com/gone'), target('https://example.com/file.pdf')],
      crawlResult,
      fetchImplementation: createFakeFetch({}),
    });

    expect(broken).toEqual([]);
  });

  it('does not count blocked or erroring targets as dead', async () => {
    const broken = await resolveBrokenBacklinkTargets({
      targets: [target('https://example.com/blocked'), target('https://example.com/error')],
      crawlResult,
      fetchImplementation: createFakeFetch({
        'https://example.com/blocked': { status: 403 },
        'https://example.com/error': { status: 500 },
      }),
    });

    expect(broken).toEqual([]);
  });
});
