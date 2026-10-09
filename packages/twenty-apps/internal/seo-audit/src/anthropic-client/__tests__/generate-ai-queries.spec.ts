import { describe, expect, it } from 'vitest';

import { buildTextMessage, createFakeAnthropicClient } from 'src/__mocks__/create-fake-anthropic-client.mock';
import { generateAiQueries } from 'src/anthropic-client/generate-ai-queries';

const CONTEXT = {
  title: 'Kanzlei Beispiel | Arbeitsrecht Berlin',
  metaDescription: 'Fachanwälte für Arbeitsrecht in Berlin.',
  businessModel: 'LOCAL_SERVICE' as const,
  servesLocalArea: true,
  pageTitles: ['Kündigung', 'Abfindung'],
};

describe('generateAiQueries', () => {
  it('asks the model for customer questions in the language of the market', async () => {
    const { client, create } = createFakeAnthropicClient(() =>
      buildTextMessage({
        queries: [
          'Welcher Anwalt hilft bei einer Kündigung in Berlin?',
          'Was kostet ein Anwalt für Arbeitsrecht?',
          'Kanzlei Beispiel Erfahrungen',
        ],
      }),
    );

    const queries = await generateAiQueries({
      client,
      context: CONTEXT,
      market: 'DE',
      ownDomain: 'kanzlei-beispiel.de',
      brandNames: ['kanzlei-beispiel', 'kanzlei beispiel'],
    });

    expect(queries).toEqual([
      'Welcher Anwalt hilft bei einer Kündigung in Berlin?',
      'Was kostet ein Anwalt für Arbeitsrecht?',
    ]);
    expect(create).toHaveBeenCalledTimes(1);

    const request = create.mock.calls[0][0] as { system: string; messages: { content: string }[] };

    expect(request.system).toContain('never use the name');
    expect(request.system).toContain('never address the business directly');
    expect(request.messages[0].content).toContain('Kanzlei Beispiel | Arbeitsrecht Berlin');
    expect(request.messages[0].content).toContain('Fachanwälte für Arbeitsrecht in Berlin.');
    expect(request.messages[0].content).toContain('Serves a local area: yes');
    expect(request.messages[0].content).toContain('Write the questions in this language: de');
    expect(request.messages[0].content).toContain('- Kündigung');
  });

  it('describes a site without a profile as unknown', async () => {
    const { client, create } = createFakeAnthropicClient(() => buildTextMessage({ queries: [] }));

    await generateAiQueries({
      client,
      context: { ...CONTEXT, businessModel: null, servesLocalArea: null },
      market: 'US',
      ownDomain: 'example.com',
      brandNames: [],
    });

    const request = create.mock.calls[0][0] as { messages: { content: string }[] };

    expect(request.messages[0].content).toContain('Business model: unknown');
    expect(request.messages[0].content).toContain('Serves a local area: unknown');
    expect(request.messages[0].content).toContain('Write the questions in this language: en');
  });

  it('returns nothing when the model gives no usable answer', async () => {
    const { client } = createFakeAnthropicClient(() => ({ stop_reason: 'max_tokens', content: [] }));

    expect(
      await generateAiQueries({ client, context: CONTEXT, market: 'DE', ownDomain: 'example.com', brandNames: [] }),
    ).toEqual([]);
  });
});
