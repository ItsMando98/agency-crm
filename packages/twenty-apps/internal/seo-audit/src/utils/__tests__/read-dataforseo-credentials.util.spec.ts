import { describe, expect, it } from 'vitest';

import { readDataForSeoCredentials } from 'src/utils/read-dataforseo-credentials.util';

describe('readDataForSeoCredentials', () => {
  it('returns trimmed credentials', () => {
    expect(
      readDataForSeoCredentials({ DATAFORSEO_LOGIN: ' me@example.com ', DATAFORSEO_PASSWORD: ' secret ' }),
    ).toEqual({ login: 'me@example.com', password: 'secret' });
  });

  it.each([
    [{}],
    [{ DATAFORSEO_LOGIN: 'me@example.com' }],
    [{ DATAFORSEO_PASSWORD: 'secret' }],
    [{ DATAFORSEO_LOGIN: '  ', DATAFORSEO_PASSWORD: 'secret' }],
  ])('returns null for incomplete credentials %j', (environment) => {
    expect(readDataForSeoCredentials(environment)).toBeNull();
  });
});
