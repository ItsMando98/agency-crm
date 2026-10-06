import { describe, expect, it } from 'vitest';

import { getTaskHorizon } from 'src/utils/get-task-horizon.util';

describe('getTaskHorizon', () => {
  it.each([
    ['CRITICAL', 'HIGH', 'WEEK'],
    ['HIGH', 'LOW', 'WEEK'],
    ['HIGH', 'HIGH', 'MONTH'],
    ['MEDIUM', 'LOW', 'MONTH'],
    ['MEDIUM', 'MEDIUM', 'QUARTER'],
    ['LOW', 'LOW', 'QUARTER'],
  ] as const)('puts %s priority with %s effort into %s', (priority, effort, horizon) => {
    expect(getTaskHorizon({ priority, effort })).toBe(horizon);
  });
});
