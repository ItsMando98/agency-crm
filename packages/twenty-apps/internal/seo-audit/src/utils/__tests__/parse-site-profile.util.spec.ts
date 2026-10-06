import { describe, expect, it } from 'vitest';

import { parseSiteProfile } from 'src/utils/parse-site-profile.util';

describe('parseSiteProfile', () => {
  it('maps a valid answer', () => {
    expect(
      parseSiteProfile({ businessModel: 'LOCAL_SERVICE', servesLocalArea: true, confidence: 0.67 }),
    ).toEqual({ businessModel: 'LOCAL_SERVICE', servesLocalArea: true, confidence: 0.67 });
  });

  it.each([
    ['null', null],
    ['unknown model', { businessModel: 'BAKERY', servesLocalArea: true, confidence: 1 }],
    ['non-boolean local flag', { businessModel: 'SAAS', servesLocalArea: 'yes', confidence: 1 }],
    ['missing confidence', { businessModel: 'SAAS', servesLocalArea: false }],
  ])('rejects %s', (_label, raw) => {
    expect(parseSiteProfile(raw)).toBeNull();
  });
});
