import { describe, expect, it } from 'vitest';

import {
  DATAFORSEO_CHATGPT_RESPONSE,
  DATAFORSEO_GEMINI_RESPONSE,
  DATAFORSEO_PERPLEXITY_RESPONSE,
} from 'src/__mocks__/dataforseo-llm-responses.mock';
import { parseAiAnswer } from 'src/utils/parse-ai-answer.util';

describe('parseAiAnswer', () => {
  it('reads the message of a ChatGPT answer and skips the reasoning entries', () => {
    const answer = parseAiAnswer(DATAFORSEO_CHATGPT_RESPONSE.tasks[0].result[0]);

    expect(answer?.text.length).toBeGreaterThan(100);
    expect(answer?.sources).toHaveLength(6);
    expect(answer?.sources[1]).toEqual({
      url: 'https://searchgptagentur.de/?utm_source=openai',
      title: 'AI Search Agentur für ChatGPT, Perplexity & GEO | Berlin',
    });
  });

  it('reads the sources of a Perplexity answer', () => {
    const answer = parseAiAnswer(DATAFORSEO_PERPLEXITY_RESPONSE.tasks[0].result[0]);

    expect(answer?.sources.map((source) => source.url)).toContain('https://www.seoagentur.de/geo-agentur/');
  });

  it('uses the real address of a Gemini source instead of the Google redirect', () => {
    const answer = parseAiAnswer(DATAFORSEO_GEMINI_RESPONSE.tasks[0].result[0]);

    expect(answer?.sources.map((source) => source.url)).toContain('https://www.diewebag.de/geo-aeo-agentur.html');
    expect(answer?.sources.every((source) => !source.url.includes('vertexaisearch'))).toBe(true);
  });

  it('returns an answer without sources when the engine cited none', () => {
    expect(
      parseAiAnswer({
        items: [{ type: 'message', sections: [{ type: 'text', text: 'Eine Antwort ohne Quellen.', annotations: null }] }],
      }),
    ).toEqual({ text: 'Eine Antwort ohne Quellen.', sources: [] });
  });

  it('joins several text sections', () => {
    expect(
      parseAiAnswer({
        items: [
          {
            type: 'message',
            sections: [
              { type: 'text', text: 'Erster Teil.' },
              { type: 'text', text: 'Zweiter Teil.' },
            ],
          },
        ],
      })?.text,
    ).toBe('Erster Teil.\nZweiter Teil.');
  });

  it('returns null when there is no message', () => {
    expect(parseAiAnswer(null)).toBeNull();
    expect(parseAiAnswer({ items: [{ type: 'reasoning' }] })).toBeNull();
    expect(parseAiAnswer({})).toBeNull();
  });

  it('skips sources without an address', () => {
    expect(
      parseAiAnswer({
        items: [
          {
            type: 'message',
            sections: [{ type: 'text', text: 'Text', annotations: [{ title: 'ohne', url: null }, { url: 'https://a.de/' }] }],
          },
        ],
      })?.sources,
    ).toEqual([{ url: 'https://a.de/', title: null }]);
  });
});
