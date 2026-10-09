import { describe, expect, it } from 'vitest';

import { parseAiQueries } from 'src/utils/parse-ai-queries.util';

const PARAMS = { ownDomain: 'kanzlei-beispiel.de', brandNames: ['kanzlei-beispiel', 'kanzlei beispiel'] };

describe('parseAiQueries', () => {
  it('keeps clean questions in order', () => {
    expect(
      parseAiQueries(
        { queries: ['Welcher Anwalt hilft bei einer Kündigung in Berlin?', 'Was kostet ein Anwalt für Arbeitsrecht?'] },
        PARAMS,
      ),
    ).toEqual(['Welcher Anwalt hilft bei einer Kündigung in Berlin?', 'Was kostet ein Anwalt für Arbeitsrecht?']);
  });

  it('drops questions that name the company or its domain', () => {
    expect(
      parseAiQueries(
        {
          queries: [
            'Ist die Kanzlei Beispiel gut für Arbeitsrecht?',
            'Was sagt kanzlei-beispiel.de zur Abfindung?',
            'Welcher Anwalt hilft bei einer Abfindung?',
          ],
        },
        PARAMS,
      ),
    ).toEqual(['Welcher Anwalt hilft bei einer Abfindung?']);
  });

  it('drops duplicates, blanks and texts that are too short or too long', () => {
    expect(
      parseAiQueries(
        {
          queries: [
            'Welcher Anwalt hilft bei einer Abfindung?',
            'welcher anwalt hilft bei einer abfindung?',
            '   ',
            'Anwalt?',
            `Frage ${'x'.repeat(250)}`,
          ],
        },
        PARAMS,
      ),
    ).toEqual(['Welcher Anwalt hilft bei einer Abfindung?']);
  });

  it('trims whitespace and ignores values that are not text', () => {
    expect(parseAiQueries({ queries: ['  Wie finde ich einen guten Anwalt?  ', 42, null] }, PARAMS)).toEqual([
      'Wie finde ich einen guten Anwalt?',
    ]);
  });

  it('limits the number of questions', () => {
    const queries = Array.from({ length: 12 }, (_, index) => `Welcher Anwalt hilft bei Fall Nummer ${index}?`);

    expect(parseAiQueries({ queries }, PARAMS)).toHaveLength(8);
  });

  it('returns nothing for an unusable answer', () => {
    expect(parseAiQueries(null, PARAMS)).toEqual([]);
    expect(parseAiQueries({ queries: 'nope' }, PARAMS)).toEqual([]);
    expect(parseAiQueries({}, PARAMS)).toEqual([]);
  });
});
