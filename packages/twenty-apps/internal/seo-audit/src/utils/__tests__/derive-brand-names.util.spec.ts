import { describe, expect, it } from 'vitest';

import { deriveBrandNames } from 'src/utils/derive-brand-names.util';

describe('deriveBrandNames', () => {
  it('uses the domain name and its spaced variant', () => {
    expect(deriveBrandNames('https://www.kanzlei-beispiel.de')).toEqual([
      'kanzlei-beispiel',
      'kanzlei beispiel',
    ]);
  });

  it('uses the name before the top level domain', () => {
    expect(deriveBrandNames('https://roaswell.com')).toEqual(['roaswell']);
    expect(deriveBrandNames('https://blog.roaswell.com/page')).toEqual(['roaswell']);
  });

  it('skips the second level label of country style domains', () => {
    expect(deriveBrandNames('https://shop.example.co.uk')).toEqual(['example']);
  });

  it('drops names that are too short to match reliably', () => {
    expect(deriveBrandNames('https://abc.de')).toEqual([]);
  });

  it('returns nothing for an address it cannot read', () => {
    expect(deriveBrandNames('not a url')).toEqual([]);
  });
});
