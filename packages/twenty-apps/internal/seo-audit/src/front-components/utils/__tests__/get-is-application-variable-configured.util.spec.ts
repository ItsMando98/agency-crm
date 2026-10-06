import { describe, expect, it } from 'vitest';

import { getIsApplicationVariableConfigured } from 'src/front-components/utils/get-is-application-variable-configured.util';

describe('getIsApplicationVariableConfigured', () => {
  it.each([
    [undefined, false],
    ['', false],
    ['   ', false],
    ['sk-ant-1234', true],
  ])('treats %j as configured: %s', (value, expected) => {
    expect(getIsApplicationVariableConfigured(value)).toBe(expected);
  });
});
