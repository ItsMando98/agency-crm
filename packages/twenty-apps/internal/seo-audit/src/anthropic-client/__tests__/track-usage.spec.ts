import { describe, expect, it, vi } from 'vitest';

import { createUsageTracker, withUsageTracking } from 'src/anthropic-client/track-usage';
import type Anthropic from '@anthropic-ai/sdk';

describe('usage tracking', () => {
  it('adds up the tokens per model and keeps the answer unchanged', async () => {
    const create = vi.fn(async (params: { model: string }) => ({
      content: [{ type: 'text', text: params.model }],
      usage: { input_tokens: 1000, output_tokens: 50 },
    }));
    const tracker = createUsageTracker();
    const client = withUsageTracking({ messages: { create } } as unknown as Anthropic, tracker);

    const answer = await client.messages.create({ model: 'claude-haiku-5-5' } as never);
    await client.messages.create({ model: 'claude-haiku-5-5' } as never);
    await client.messages.create({ model: 'claude-opus-5-5' } as never);

    expect((answer as unknown as { content: { text: string }[] }).content[0]?.text).toBe('claude-haiku-5-5');
    expect(tracker.snapshot()).toEqual({
      'claude-haiku-5-5': { calls: 2, inputTokens: 2000, outputTokens: 100 },
      'claude-opus-5-5': { calls: 1, inputTokens: 1000, outputTokens: 50 },
    });
  });

  it('counts a call even when the response carries no usage', async () => {
    const tracker = createUsageTracker();
    const client = withUsageTracking(
      { messages: { create: async () => ({ content: [] }) } } as unknown as Anthropic,
      tracker,
    );

    await client.messages.create({ model: 'claude-haiku-5-5' } as never);

    expect(tracker.snapshot()).toEqual({
      'claude-haiku-5-5': { calls: 1, inputTokens: 0, outputTokens: 0 },
    });
  });

  it('still lets errors through', async () => {
    const client = withUsageTracking(
      { messages: { create: async () => { throw new Error('rate limited'); } } } as unknown as Anthropic,
      createUsageTracker(),
    );

    await expect(client.messages.create({ model: 'x' } as never)).rejects.toThrow('rate limited');
  });
});
