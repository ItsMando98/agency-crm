import { describe, expect, it } from 'vitest';

import { sortTasksByPriority } from 'src/utils/sort-tasks-by-priority.util';

describe('sortTasksByPriority', () => {
  it('puts the most important task first', () => {
    const sorted = sortTasksByPriority([
      { id: 'low', priority: 'LOW', effort: 'LOW' },
      { id: 'critical', priority: 'CRITICAL', effort: 'HIGH' },
      { id: 'high', priority: 'HIGH', effort: 'LOW' },
    ] as const);

    expect(sorted.map((task) => task.id)).toEqual(['critical', 'high', 'low']);
  });

  it('puts the cheaper fix first within a priority', () => {
    const sorted = sortTasksByPriority([
      { id: 'hard', priority: 'HIGH', effort: 'HIGH' },
      { id: 'easy', priority: 'HIGH', effort: 'LOW' },
      { id: 'medium', priority: 'HIGH', effort: 'MEDIUM' },
    ] as const);

    expect(sorted.map((task) => task.id)).toEqual(['easy', 'medium', 'hard']);
  });

  it('does not change the input', () => {
    const tasks = [
      { id: 'b', priority: 'LOW', effort: 'LOW' },
      { id: 'a', priority: 'CRITICAL', effort: 'LOW' },
    ] as const;

    sortTasksByPriority([...tasks]);

    expect(tasks.map((task) => task.id)).toEqual(['b', 'a']);
  });
});
