import { describe, expect, it } from 'vitest';

import { getSetupProgress } from 'src/front-components/utils/get-setup-progress.util';

describe('getSetupProgress', () => {
  it('ignores optional steps', () => {
    expect(
      getSetupProgress([
        { id: 'ANTHROPIC_KEY', status: 'DONE' },
        { id: 'DEFAULTS', status: 'OPTIONAL' },
        { id: 'FIRST_AUDIT', status: 'TODO' },
      ]),
    ).toEqual({ completed: 1, total: 2, percentage: 50 });
  });

  it('reports 100 percent when everything required is done', () => {
    expect(
      getSetupProgress([
        { id: 'ANTHROPIC_KEY', status: 'DONE' },
        { id: 'FIRST_AUDIT', status: 'DONE' },
      ]).percentage,
    ).toBe(100);
  });

  it('does not divide by zero without required steps', () => {
    expect(getSetupProgress([{ id: 'DEFAULTS', status: 'OPTIONAL' }]).percentage).toBe(100);
  });
});
