import { describe, expect, it } from 'vitest';

import { classifyDataForSeoStatus } from 'src/utils/classify-dataforseo-status.util';

describe('classifyDataForSeoStatus', () => {
  it.each([
    [401, 'AUTHENTICATION'],
    [40101, 'AUTHENTICATION'],
    [402, 'PAYMENT'],
    [40200, 'PAYMENT'],
    [403, 'ACCESS'],
    [40301, 'ACCESS'],
    [50000, 'OTHER'],
    [40501, 'OTHER'],
    [0, 'OTHER'],
  ])('maps %i to %s', (code, kind) => {
    expect(classifyDataForSeoStatus(code)).toBe(kind);
  });
});
