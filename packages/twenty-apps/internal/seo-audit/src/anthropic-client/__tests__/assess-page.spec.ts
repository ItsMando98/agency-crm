import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import {
  buildTextMessage,
  createFakeAnthropicClient,
} from 'src/__mocks__/create-fake-anthropic-client.mock';
import { assessPage } from 'src/anthropic-client/assess-page';

const ANSWER = {
  pageType: 'SERVICE',
  searchIntent: 'COMMERCIAL',
  helpfulness: 2,
  specificity: 3,
  trust: 4,
  confidence: 0.8,
};

describe('assessPage', () => {
  it('returns the assessment for the page URL', async () => {
    const { client, create } = createFakeAnthropicClient(() => buildTextMessage(ANSWER));
    const page = buildCrawledPage({ url: 'https://example.com/a', textExcerpt: 'Some page text' });

    expect(await assessPage({ client, page })).toEqual({
      url: 'https://example.com/a',
      ...ANSWER,
      needsReview: false,
    });
    expect(create.mock.calls[0][0].messages[0].content).toContain('Some page text');
  });

  it('returns null for an answer that fails validation', async () => {
    const { client } = createFakeAnthropicClient(() => buildTextMessage({ ...ANSWER, helpfulness: 9 }));

    expect(await assessPage({ client, page: buildCrawledPage() })).toBeNull();
  });
});
