import { describe, expect, it } from 'vitest';

import { escapeCssString } from 'src/utils/escape-css-string.util';

describe('escapeCssString', () => {
  it('escapes quotes, backslashes, line breaks and tag openers', () => {
    expect(escapeCssString('a"b\\c\nd</style>')).toBe('a\\"b\\\\c d\\3C /style>');
  });
});
