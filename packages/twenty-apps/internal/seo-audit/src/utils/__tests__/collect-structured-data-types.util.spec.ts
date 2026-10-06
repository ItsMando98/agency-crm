import { describe, expect, it } from 'vitest';

import { collectStructuredDataTypes } from 'src/utils/collect-structured-data-types.util';

describe('collectStructuredDataTypes', () => {
  it('collects single, array and graph types', () => {
    const types = collectStructuredDataTypes([
      '{"@type":"LocalBusiness","address":{"@type":"PostalAddress"}}',
      '{"@graph":[{"@type":["Organization","Brand"]},{"@type":"WebSite"}]}',
    ]);

    expect(types.sort()).toEqual([
      'Brand',
      'LocalBusiness',
      'Organization',
      'PostalAddress',
      'WebSite',
    ]);
  });

  it('skips invalid JSON blocks without throwing', () => {
    expect(collectStructuredDataTypes(['{ broken', '{"@type":"Product"}'])).toEqual([
      'Product',
    ]);
  });

  it('returns an empty list when there is nothing', () => {
    expect(collectStructuredDataTypes([])).toEqual([]);
  });
});
