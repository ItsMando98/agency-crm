import { describe, expect, it } from 'vitest';

import { parseVariableOptions } from 'src/front-components/utils/parse-variable-options.util';

describe('parseVariableOptions', () => {
  it('keeps well-formed options', () => {
    expect(parseVariableOptions([{ label: 'German', value: 'DE' }])).toEqual([
      { label: 'German', value: 'DE' },
    ]);
  });

  it('drops malformed entries', () => {
    expect(parseVariableOptions([{ label: 'x' }, null, { label: 'English', value: 'EN' }])).toEqual([
      { label: 'English', value: 'EN' },
    ]);
  });

  it.each([null, undefined, 'DE', {}, []])('returns null for %j', (raw) => {
    expect(parseVariableOptions(raw)).toBeNull();
  });
});
