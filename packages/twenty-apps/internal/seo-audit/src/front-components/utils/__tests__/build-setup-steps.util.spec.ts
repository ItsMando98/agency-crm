import { describe, expect, it } from 'vitest';

import { buildSetupSteps } from 'src/front-components/utils/build-setup-steps.util';

describe('buildSetupSteps', () => {
  it('starts with the key and the first audit open and defaults optional', () => {
    expect(buildSetupSteps({ isApiKeyConfigured: false, hasFinishedAudit: false })).toEqual([
      { id: 'ANTHROPIC_KEY', status: 'TODO' },
      { id: 'DEFAULTS', status: 'OPTIONAL' },
      { id: 'FIRST_AUDIT', status: 'TODO' },
    ]);
  });

  it('marks steps as done independently', () => {
    expect(buildSetupSteps({ isApiKeyConfigured: true, hasFinishedAudit: false })[0].status).toBe('DONE');
    expect(buildSetupSteps({ isApiKeyConfigured: false, hasFinishedAudit: true })[2].status).toBe('DONE');
  });
});
