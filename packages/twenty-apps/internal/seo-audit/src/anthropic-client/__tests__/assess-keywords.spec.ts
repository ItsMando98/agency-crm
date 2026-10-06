import { describe, expect, it } from 'vitest';

import {
  buildTextMessage,
  createFakeAnthropicClient,
} from 'src/__mocks__/create-fake-anthropic-client.mock';
import { assessKeywords } from 'src/anthropic-client/assess-keywords';

const CONTEXT = { title: 'Fliesen Müller', metaDescription: null, businessModel: null, pageTitles: [] };

describe('assessKeywords', () => {
  it('judges keywords in batches of 50 and merges the answers', async () => {
    const keywords = Array.from({ length: 120 }, (_, index) => `keyword ${index}`);
    const { client, create } = createFakeAnthropicClient(({ messages }) => {
      const count = (messages[0].content.match(/^\d+: /gm) ?? []).length;

      return buildTextMessage({
        keywords: Array.from({ length: count }, (_, index) => ({ index, relevance: 0.8, confidence: 0.9 })),
      });
    });

    const assessments = await assessKeywords({ client, keywords, context: CONTEXT });

    expect(create).toHaveBeenCalledTimes(3);
    expect(assessments).toHaveLength(120);
    expect(assessments[119].keyword).toBe('keyword 119');
  });

  it('keeps the other batches when one batch cannot be judged', async () => {
    const keywords = Array.from({ length: 60 }, (_, index) => `keyword ${index}`);
    let calls = 0;
    const { client } = createFakeAnthropicClient(() => {
      calls += 1;

      return calls === 1
        ? { stop_reason: 'max_tokens', content: [] }
        : buildTextMessage({ keywords: [{ index: 0, relevance: 0.9, confidence: 0.9 }] });
    });

    const assessments = await assessKeywords({ client, keywords, context: CONTEXT });

    expect(assessments).toHaveLength(1);
  });

  it('does nothing without keywords', async () => {
    const { client, create } = createFakeAnthropicClient(() => buildTextMessage({ keywords: [] }));

    expect(await assessKeywords({ client, keywords: [], context: CONTEXT })).toEqual([]);
    expect(create).not.toHaveBeenCalled();
  });
});
