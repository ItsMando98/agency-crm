import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import {
  buildTextMessage,
  createFakeAnthropicClient,
} from 'src/__mocks__/create-fake-anthropic-client.mock';
import { assessSiteProfile } from 'src/anthropic-client/assess-site-profile';

describe('assessSiteProfile', () => {
  it('returns the business profile of the homepage', async () => {
    const { client } = createFakeAnthropicClient(() =>
      buildTextMessage({ businessModel: 'LOCAL_SERVICE', servesLocalArea: true, confidence: 0.9 }),
    );

    expect(await assessSiteProfile({ client, homepage: buildCrawledPage() })).toEqual({
      businessModel: 'LOCAL_SERVICE',
      servesLocalArea: true,
      confidence: 0.9,
    });
  });

  it('returns null when the answer cannot be used', async () => {
    const { client } = createFakeAnthropicClient(() => buildTextMessage({ businessModel: 'NOPE' }));

    expect(await assessSiteProfile({ client, homepage: buildCrawledPage() })).toBeNull();
  });
});
