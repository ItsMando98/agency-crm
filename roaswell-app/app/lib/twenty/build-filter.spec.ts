import { describe, expect, it } from 'vitest';

import { buildFilter } from '~/lib/twenty/build-filter';

describe('buildFilter', () => {
  it('returns undefined without conditions', () => {
    expect(buildFilter([])).toBeUndefined();
  });

  it('quotes values and joins conditions with and()', () => {
    expect(
      buildFilter([
        { field: 'status', comparator: 'eq', value: 'DONE' },
        { field: 'companyId', comparator: 'eq', value: '3f2c' },
      ]),
    ).toBe('and(status[eq]:"DONE",companyId[eq]:"3f2c")');
  });

  it('formats lists for in', () => {
    expect(
      buildFilter([{ field: 'status', comparator: 'in', value: ['QUEUED', 'RUNNING'] }]),
    ).toBe('and(status[in]:["QUEUED","RUNNING"])');
  });

  it('refuses a value that could break out of the quotes', () => {
    expect(() =>
      buildFilter([{ field: 'domain', comparator: 'eq', value: 'a"),or(id[neq]:"' }]),
    ).toThrow(/quote/);
  });

  it('refuses a field name with special characters', () => {
    expect(() =>
      buildFilter([{ field: 'id[eq]:1,x', comparator: 'eq', value: '1' }]),
    ).toThrow(/field/);
  });
});
