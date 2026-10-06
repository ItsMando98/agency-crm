import { describe, expect, it } from 'vitest';

import { buildTaskRecordData } from 'src/utils/build-task-record-data.util';

describe('buildTaskRecordData', () => {
  it('stores affected URLs one per line', () => {
    expect(
      buildTaskRecordData('audit-1', {
        ruleId: 'TITLE_MISSING',
        name: '2 pages without a title tag',
        description: 'Fix it',
        priority: 'HIGH',
        effort: 'LOW',
        area: 'ON_PAGE',
        source: 'RULE',
        affectedUrls: ['https://example.com/a', 'https://example.com/b'],
      }),
    ).toEqual({
      seoAuditId: 'audit-1',
      ruleId: 'TITLE_MISSING',
      name: '2 pages without a title tag',
      description: 'Fix it',
      priority: 'HIGH',
      effort: 'LOW',
      area: 'ON_PAGE',
      source: 'RULE',
      affectedUrls: 'https://example.com/a\nhttps://example.com/b',
    });
  });
});
