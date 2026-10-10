import { describe, expect, it } from 'vitest';

import { describeAiVisibilityProvider } from 'src/front-components/utils/describe-ai-visibility-provider.util';

describe('describeAiVisibilityProvider', () => {
  it('names treg first, because it is used before DataForSEO', () => {
    expect(
      describeAiVisibilityProvider({ isTregConfigured: true, isDataForSeoConfigured: true }),
    ).toMatch(/^Answers come from treg/);
  });

  it('names DataForSEO when it is the only provider and points to the cheaper one', () => {
    expect(
      describeAiVisibilityProvider({ isTregConfigured: false, isDataForSeoConfigured: true }),
    ).toMatch(/DataForSEO.*treg token makes it cheaper/);
  });

  it('asks for a provider when there is none', () => {
    expect(
      describeAiVisibilityProvider({ isTregConfigured: false, isDataForSeoConfigured: false }),
    ).toBe('Add a treg token or a DataForSEO login to use this check.');
  });
});
