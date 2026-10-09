import { describe, expect, it } from 'vitest';

import { buildAiVisibility } from 'src/__mocks__/build-ai-visibility.mock';
import { buildAiVisibilityTable } from 'src/utils/build-ai-visibility-table.util';

describe('buildAiVisibilityTable', () => {
  it('writes the header and one row per question in English', () => {
    expect(buildAiVisibilityTable(buildAiVisibility(), 'EN')).toEqual({
      header: ['Question', 'ChatGPT', 'Perplexity', 'Gemini', 'Named instead'],
      rows: [
        ['Welcher Anwalt hilft bei einer Kündigung?', 'cited', 'absent', 'n/a', 'rival.de, other.de'],
        ['Was kostet ein Anwalt für Arbeitsrecht?', 'mentioned', 'absent', 'absent', '-'],
      ],
    });
  });

  it('writes the status words in German', () => {
    const { header, rows } = buildAiVisibilityTable(buildAiVisibility(), 'DE');

    expect(header[0]).toBe('Frage');
    expect(header[4]).toBe('Stattdessen genannt');
    expect(rows[0].slice(1, 4)).toEqual(['zitiert', 'fehlt', 'n/v']);
    expect(rows[1][1]).toBe('erwähnt');
  });

  it('has no rows when nothing was asked', () => {
    expect(buildAiVisibilityTable(buildAiVisibility({ rows: [] }), 'EN').rows).toEqual([]);
  });
});
