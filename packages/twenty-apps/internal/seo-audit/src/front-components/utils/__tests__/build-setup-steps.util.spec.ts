import { describe, expect, it } from 'vitest';

import { buildSetupSteps } from 'src/front-components/utils/build-setup-steps.util';

const baseParams = {
  isApiKeyConfigured: false,
  isDataForSeoConfigured: false,
  hasFinishedAudit: false,
};

describe('buildSetupSteps', () => {
  it('starts with the key and the first audit open and the rest optional', () => {
    expect(buildSetupSteps(baseParams)).toEqual([
      { id: 'ANTHROPIC_KEY', status: 'TODO' },
      { id: 'DATAFORSEO', status: 'OPTIONAL' },
      { id: 'DEFAULTS', status: 'OPTIONAL' },
      { id: 'FIRST_AUDIT', status: 'TODO' },
    ]);
  });

  it('marks steps as done independently', () => {
    const statusOf = (overrides: Partial<typeof baseParams>, id: string) =>
      buildSetupSteps({ ...baseParams, ...overrides }).find((step) => step.id === id)?.status;

    expect(statusOf({ isApiKeyConfigured: true }, 'ANTHROPIC_KEY')).toBe('DONE');
    expect(statusOf({ isDataForSeoConfigured: true }, 'DATAFORSEO')).toBe('DONE');
    expect(statusOf({ hasFinishedAudit: true }, 'FIRST_AUDIT')).toBe('DONE');
  });
});
