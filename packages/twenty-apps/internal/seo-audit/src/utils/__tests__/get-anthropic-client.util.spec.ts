import { afterEach, describe, expect, it } from 'vitest';

import { getAnthropicClient } from 'src/utils/get-anthropic-client.util';

describe('getAnthropicClient', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalKey;
    }
  });

  it('returns null when no key is configured', () => {
    delete process.env.ANTHROPIC_API_KEY;

    expect(getAnthropicClient()).toBeNull();

    process.env.ANTHROPIC_API_KEY = '   ';

    expect(getAnthropicClient()).toBeNull();
  });

  it('creates a client when a key is configured', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';

    expect(getAnthropicClient()).not.toBeNull();
  });
});
