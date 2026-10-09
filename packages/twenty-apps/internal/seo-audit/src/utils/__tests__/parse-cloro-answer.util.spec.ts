import { describe, expect, it } from 'vitest';

import { parseCloroAnswer } from 'src/utils/parse-cloro-answer.util';

describe('parseCloroAnswer', () => {
  it('reads the text and merges the sources with the citation pills without duplicates', () => {
    expect(
      parseCloroAnswer({
        success: true,
        result: {
          text: 'Eine ausführliche Antwort.',
          sources: [
            { position: 1, label: 'Erste Quelle', url: 'https://a.de/x?utm_source=chatgpt.com', footnote: false },
            { position: 2, label: '', url: 'https://b.de/', footnote: true },
          ],
          citationPills: [
            { url: 'https://c.de/', label: 'Dritte', domain: 'c.de', position: 1 },
            { url: 'https://a.de/x?utm_source=chatgpt.com', label: 'Erste Quelle', domain: 'a.de', position: 2 },
          ],
        },
      }),
    ).toEqual({
      text: 'Eine ausführliche Antwort.',
      sources: [
        { url: 'https://a.de/x?utm_source=chatgpt.com', title: 'Erste Quelle' },
        { url: 'https://b.de/', title: null },
        { url: 'https://c.de/', title: 'Dritte' },
      ],
    });
  });

  it('keeps an answer that has no sources', () => {
    expect(
      parseCloroAnswer({ success: true, result: { text: 'Nur Text.', sources: [], citationPills: [] } }),
    ).toEqual({ text: 'Nur Text.', sources: [] });
  });

  it('takes the sources from the citation pills when the list is missing', () => {
    expect(
      parseCloroAnswer({
        success: true,
        result: { text: 'Text', citationPills: [{ url: 'https://c.de/', label: 'C' }] },
      })?.sources,
    ).toEqual([{ url: 'https://c.de/', title: 'C' }]);
  });

  it('skips entries without an address', () => {
    expect(
      parseCloroAnswer({
        success: true,
        result: { text: 'Text', sources: [{ label: 'ohne' }, { url: '', label: 'leer' }, { url: 'https://a.de/' }] },
      })?.sources,
    ).toEqual([{ url: 'https://a.de/', title: null }]);
  });

  it('returns null when cloro reports a failure or sends no result', () => {
    expect(parseCloroAnswer({ success: false, error: 'blocked' })).toBeNull();
    expect(parseCloroAnswer({ success: true })).toBeNull();
    expect(parseCloroAnswer(null)).toBeNull();
    expect(parseCloroAnswer('nope')).toBeNull();
  });
});
