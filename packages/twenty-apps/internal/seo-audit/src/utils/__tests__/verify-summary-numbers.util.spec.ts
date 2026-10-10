import { describe, expect, it } from 'vitest';

import { extractNumbers } from 'src/utils/extract-numbers.util';
import { collectFactNumbers, findUnverifiedNumbers } from 'src/utils/verify-summary-numbers.util';

describe('extractNumbers', () => {
  it.each([
    ['29 Seiten', [29]],
    ['rund 54.000 Besucher', [54000]],
    ['about 54,000 visitors', [54000]],
    ['Relevanz 0,67 und 0.03', [0.67, 0.03]],
    ['1.234.567 Suchen', [1234567]],
    ['Score 81 von 100, Note B', [81, 100]],
    ['Platz 17 mit 60.000 Suchen', [17, 60000]],
    ['kein Wert', []],
  ])('reads %j', (text, expected) => {
    expect(extractNumbers(text).map(({ value }) => value)).toEqual(expected);
  });
});

describe('collectFactNumbers', () => {
  it('collects values from nested data and from numbers inside strings', () => {
    const numbers = collectFactNumbers({
      score: 81,
      areas: { SECURITY: 98 },
      tasks: [{ title: '29 verlinkte Seiten existieren nicht mehr' }],
      share: 0.69,
    });

    expect([...numbers].sort((a, b) => a - b)).toEqual([0.69, 29, 69, 81, 98]);
  });
});

describe('findUnverifiedNumbers', () => {
  const facts = collectFactNumbers({
    score: 74,
    deadLinks: 29,
    traffic: 54000,
    relevance: 0.03,
    sure: 0.69,
  });

  it('lets numbers pass that the facts contain, in any notation', () => {
    expect(
      findUnverifiedNumbers('Score 74, 29 tote Links, rund 54.000 Besucher, Relevanz 0,03, 69 % eindeutig.', facts),
    ).toEqual([]);
  });

  it('flags a number that appears nowhere in the facts', () => {
    expect(findUnverifiedNumbers('Es gibt 31 tote Links und der Score liegt bei 74.', facts)).toEqual(['31']);
  });

  it('flags each wrong number once', () => {
    expect(findUnverifiedNumbers('77 Seiten, 77 Links, 12 Aufgaben.', facts)).toEqual(['77', '12']);
  });

  it('does not accept a rounded or altered figure', () => {
    expect(findUnverifiedNumbers('Etwa 50.000 Besucher.', facts)).toEqual(['50.000']);
  });
});
