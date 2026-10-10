import { describe, expect, it } from 'vitest';

import { buildTextMessage, createFakeAnthropicClient } from 'src/__mocks__/create-fake-anthropic-client.mock';
import { findCompetingPages } from 'src/anthropic-client/find-competing-pages';
import { type CompetingPageCandidate } from 'src/utils/build-competing-pages-input.util';
import { parseCompetingPages } from 'src/utils/parse-competing-pages.util';

const candidates: CompetingPageCandidate[] = ['a', 'b', 'c', 'd', 'e'].map((name) => ({
  url: `https://x.de/${name}`,
  title: `Seite ${name}`,
  pageType: 'SERVICE',
  searchIntent: 'COMMERCIAL',
}));

describe('findCompetingPages', () => {
  it('sends every page with its number and maps the groups back to urls', async () => {
    const { client, create } = createFakeAnthropicClient(() =>
      buildTextMessage({ groups: [{ topic: 'Kündigungsfrist', pages: [0, 2] }] }),
    );

    const groups = await findCompetingPages({ client, candidates });

    expect(groups).toEqual([{ topic: 'Kündigungsfrist', urls: ['https://x.de/a', 'https://x.de/c'] }]);
    const request = create.mock.calls[0]?.[0] as unknown as { messages: { content: string }[] };

    expect(request.messages[0]?.content).toContain('0: Seite a | https://x.de/a | SERVICE | COMMERCIAL');
  });

  it('does not ask for a small site', async () => {
    const { client, create } = createFakeAnthropicClient(() => buildTextMessage({ groups: [] }));

    expect(await findCompetingPages({ client, candidates: candidates.slice(0, 3) })).toEqual([]);
    expect(create).not.toHaveBeenCalled();
  });
});

describe('parseCompetingPages', () => {
  const urls = ['u0', 'u1', 'u2', 'u3'];

  it('drops groups of one, unknown numbers and pages already in a group', () => {
    expect(
      parseCompetingPages(
        {
          groups: [
            { topic: 'Eins', pages: [0] },
            { topic: 'Zwei', pages: [0, 1, 9] },
            { topic: 'Drei', pages: [1, 2] },
            { topic: '', pages: [2, 3] },
          ],
        },
        urls,
      ),
    ).toEqual([{ topic: 'Zwei', urls: ['u0', 'u1'] }]);
  });

  it('returns nothing for unexpected shapes', () => {
    expect(parseCompetingPages(null, urls)).toEqual([]);
    expect(parseCompetingPages({ groups: 'x' }, urls)).toEqual([]);
  });
});
