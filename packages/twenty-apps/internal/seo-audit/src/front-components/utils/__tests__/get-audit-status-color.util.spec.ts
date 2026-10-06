import { describe, expect, it } from 'vitest';

import { getAuditStatusColor } from 'src/front-components/utils/get-audit-status-color.util';

describe('getAuditStatusColor', () => {
  it.each([
    ['QUEUED', 'blue'],
    ['RUNNING', 'purple'],
    ['DONE', 'green'],
    ['FAILED', 'red'],
    ['SOMETHING', 'gray'],
    [null, 'gray'],
  ])('maps %s to %s', (status, color) => {
    expect(getAuditStatusColor(status)).toBe(color);
  });
});
