import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';

import {
  buildTextMessage,
  createFakeAnthropicClient,
} from 'src/__mocks__/create-fake-anthropic-client.mock';
import { requestStructuredJson } from 'src/anthropic-client/request-structured-json';

const PARAMS = {
  system: 'system prompt',
  userContent: 'user content',
  schema: { type: 'object' },
  maxTokens: 100,
};

describe('requestStructuredJson', () => {
  it('sends the schema as structured output and returns the parsed JSON', async () => {
    const { client, create } = createFakeAnthropicClient(() => buildTextMessage({ ok: true }));

    expect(await requestStructuredJson({ client, ...PARAMS })).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-5-5',
        max_tokens: 100,
        system: 'system prompt',
        output_config: { format: { type: 'json_schema', schema: { type: 'object' } } },
      }),
    );
  });

  it('does not send a temperature, which newer models reject', async () => {
    const { client, create } = createFakeAnthropicClient(() => buildTextMessage({ ok: true }));

    await requestStructuredJson({ client, ...PARAMS });

    expect(create.mock.calls[0][0]).not.toHaveProperty('temperature');
  });

  it('returns null when the model did not finish normally', async () => {
    const { client } = createFakeAnthropicClient(() => ({ stop_reason: 'max_tokens', content: [] }));

    expect(await requestStructuredJson({ client, ...PARAMS })).toBeNull();
  });

  it('returns null for invalid JSON and for answers without text', async () => {
    const invalid = createFakeAnthropicClient(() => ({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: '{ nope' }],
    }));
    const empty = createFakeAnthropicClient(() => ({ stop_reason: 'end_turn', content: [] }));

    expect(await requestStructuredJson({ client: invalid.client, ...PARAMS })).toBeNull();
    expect(await requestStructuredJson({ client: empty.client, ...PARAMS })).toBeNull();
  });

  it('swallows transient API errors for a single page', async () => {
    const { client } = createFakeAnthropicClient(() => {
      throw Anthropic.APIError.generate(529, { error: { message: 'overloaded' } }, 'overloaded', new Headers());
    });

    expect(await requestStructuredJson({ client, ...PARAMS })).toBeNull();
  });

  it('reports an API error to the caller before returning null', async () => {
    const { client } = createFakeAnthropicClient(() => {
      throw Anthropic.APIError.generate(400, { error: { message: 'unsupported parameter' } }, 'unsupported parameter', new Headers());
    });
    const reported: string[] = [];

    await requestStructuredJson({ client, ...PARAMS, onError: (message) => reported.push(message) });

    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain('unsupported parameter');
  });

  it('reports an unfinished answer to the caller', async () => {
    const { client } = createFakeAnthropicClient(() => ({ stop_reason: 'max_tokens', content: [] }));
    const reported: string[] = [];

    await requestStructuredJson({ client, ...PARAMS, onError: (message) => reported.push(message) });

    expect(reported).toEqual(['The model stopped with max_tokens before it finished the answer.']);
  });

  it('reports an answer that is not valid JSON', async () => {
    const { client } = createFakeAnthropicClient(() => ({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: '{ nope' }],
    }));
    const reported: string[] = [];

    await requestStructuredJson({ client, ...PARAMS, onError: (message) => reported.push(message) });

    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain('not valid JSON');
  });

  it('rethrows credential errors so a bad key fails the audit', async () => {
    const { client } = createFakeAnthropicClient(() => {
      throw Anthropic.APIError.generate(401, { error: { message: 'invalid x-api-key' } }, 'invalid x-api-key', new Headers());
    });

    await expect(requestStructuredJson({ client, ...PARAMS })).rejects.toBeInstanceOf(
      Anthropic.AuthenticationError,
    );
  });
});
