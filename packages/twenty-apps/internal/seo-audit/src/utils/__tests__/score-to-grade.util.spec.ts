import { describe, expect, it } from 'vitest';

import { scoreToGrade } from 'src/utils/score-to-grade.util';

describe('scoreToGrade', () => {
  it.each([
    [100, 'A'],
    [90, 'A'],
    [89, 'B'],
    [81, 'B'],
    [70, 'C'],
    [60, 'D'],
    [50, 'E'],
    [49, 'F'],
    [0, 'F'],
  ])('maps %i to %s', (score, grade) => {
    expect(scoreToGrade(score)).toBe(grade);
  });
});
