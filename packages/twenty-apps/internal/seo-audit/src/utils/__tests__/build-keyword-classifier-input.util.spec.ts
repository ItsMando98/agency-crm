import { describe, expect, it } from 'vitest';

import { buildKeywordClassifierInput } from 'src/utils/build-keyword-classifier-input.util';

describe('buildKeywordClassifierInput', () => {
  it('describes the business and numbers the keywords from zero', () => {
    const input = buildKeywordClassifierInput(
      {
        title: 'Fliesen Müller',
        metaDescription: 'Fliesen in Berlin',
        businessModel: 'ECOMMERCE',
        pageTitles: ['Bodenfliesen', 'Wandfliesen'],
      },
      ['fliesen kaufen', 'keramik butterdose'],
    );

    expect(input).toContain('Homepage title: Fliesen Müller');
    expect(input).toContain('Page titles: Bodenfliesen | Wandfliesen');
    expect(input).toContain('<keywords>\n0: fliesen kaufen\n1: keramik butterdose\n</keywords>');
  });

  it('makes missing context explicit', () => {
    const input = buildKeywordClassifierInput(
      { title: null, metaDescription: null, businessModel: null, pageTitles: [] },
      ['x'],
    );

    expect(input).toContain('Homepage title: (none)');
    expect(input).toContain('Business model guess: (unknown)');
    expect(input).toContain('Page titles: (none)');
  });
});
