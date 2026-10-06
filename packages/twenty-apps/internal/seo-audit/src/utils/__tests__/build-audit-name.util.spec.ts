import { describe, expect, it } from 'vitest';

import { buildAuditName } from 'src/utils/build-audit-name.util';

describe('buildAuditName', () => {
  it('combines hostname and ISO date', () => {
    expect(buildAuditName('https://www.example.com', new Date('2026-10-06T23:00:00Z'))).toBe(
      'www.example.com 2026-10-06',
    );
  });
});
