import { describe, expect, it } from 'vitest';

import { readTregCredentials } from 'src/utils/read-treg-credentials.util';

describe('readTregCredentials', () => {
  it('reads the token and the team and trims both', () => {
    expect(readTregCredentials({ TREG_TOKEN: ' tok ', TREG_ORG: ' landoo ' })).toEqual({
      token: 'tok',
      organization: 'landoo',
    });
  });

  it('works with the token alone', () => {
    expect(readTregCredentials({ TREG_TOKEN: 'tok' })).toEqual({ token: 'tok', organization: null });
    expect(readTregCredentials({ TREG_TOKEN: 'tok', TREG_ORG: '  ' })).toEqual({
      token: 'tok',
      organization: null,
    });
  });

  it('returns null without a token', () => {
    expect(readTregCredentials({})).toBeNull();
    expect(readTregCredentials({ TREG_TOKEN: '   ', TREG_ORG: 'landoo' })).toBeNull();
  });
});
