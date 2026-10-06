import type Anthropic from '@anthropic-ai/sdk';
import { vi } from 'vitest';

type FakeMessage = {
  stop_reason: string;
  content: { type: string; text?: string }[];
};

export const buildTextMessage = (payload: unknown): FakeMessage => ({
  stop_reason: 'end_turn',
  content: [{ type: 'text', text: JSON.stringify(payload) }],
});

export const createFakeAnthropicClient = (
  respond: (request: { system: string; messages: { content: string }[] }) => FakeMessage | Promise<FakeMessage>,
) => {
  const create = vi.fn(respond);

  return {
    client: { messages: { create } } as unknown as Anthropic,
    create,
  };
};
