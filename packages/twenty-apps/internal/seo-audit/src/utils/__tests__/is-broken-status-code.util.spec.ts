import { describe, expect, it } from 'vitest';

import { isBrokenStatusCode } from 'src/utils/is-broken-status-code.util';

describe('isBrokenStatusCode', () => {
  it.each([404, 410, 400])('treats %i as broken', (statusCode) => {
    expect(isBrokenStatusCode(statusCode)).toBe(true);
  });

  it.each([200, 301, 401, 403, 429, 500, 503, 0])('does not treat %i as broken', (statusCode) => {
    expect(isBrokenStatusCode(statusCode)).toBe(false);
  });
});
