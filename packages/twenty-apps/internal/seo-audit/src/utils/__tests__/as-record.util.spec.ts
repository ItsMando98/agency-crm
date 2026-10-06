import { describe, expect, it } from 'vitest';

import { asRecord } from 'src/utils/as-record.util';

describe('asRecord', () => {
  it('returns objects and rejects everything else', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord([1])).toBeNull();
    expect(asRecord(null)).toBeNull();
    expect(asRecord('x')).toBeNull();
  });
});
