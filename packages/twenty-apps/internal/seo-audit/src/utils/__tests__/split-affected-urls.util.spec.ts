import { describe, expect, it } from 'vitest';

import { splitAffectedUrls } from 'src/utils/split-affected-urls.util';

describe('splitAffectedUrls', () => {
  it('returns one entry per line', () => {
    expect(splitAffectedUrls('https://a.de/\nhttps://a.de/b')).toEqual(['https://a.de/', 'https://a.de/b']);
  });

  it('drops blank lines and whitespace', () => {
    expect(splitAffectedUrls('  https://a.de/  \n\n \n')).toEqual(['https://a.de/']);
  });

  it('returns an empty list without a value', () => {
    expect(splitAffectedUrls(null)).toEqual([]);
    expect(splitAffectedUrls(undefined)).toEqual([]);
    expect(splitAffectedUrls('')).toEqual([]);
  });
});
