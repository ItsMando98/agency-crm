import { describe, expect, it } from 'vitest';

import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';

describe('buildAuditTasks', () => {
  it('fills the count into the title and uses the requested language', () => {
    const [german] = buildAuditTasks(
      [{ ruleId: 'TITLE_MISSING', affectedUrls: ['https://example.com/a', 'https://example.com/b'] }],
      'DE',
    );
    const [english] = buildAuditTasks(
      [{ ruleId: 'TITLE_MISSING', affectedUrls: ['https://example.com/a'] }],
      'EN',
    );

    expect(german.name).toBe('2 Seiten ohne Title-Tag');
    expect(english.name).toBe('1 pages without a title tag');
    expect(german).toMatchObject({ area: 'ON_PAGE', priority: 'HIGH', effort: 'LOW', source: 'RULE' });
  });

  it('sorts by priority, then effort, then affected pages', () => {
    const tasks = buildAuditTasks(
      [
        { ruleId: 'ROBOTS_TXT_MISSING', affectedUrls: [] },
        { ruleId: 'LOW_HELPFULNESS', affectedUrls: ['https://example.com/a'] },
        { ruleId: 'NOT_HTTPS', affectedUrls: [] },
        { ruleId: 'TITLE_MISSING', affectedUrls: ['https://example.com/a'] },
      ],
      'EN',
    );

    expect(tasks.map((task) => task.ruleId)).toEqual([
      'NOT_HTTPS',
      'TITLE_MISSING',
      'LOW_HELPFULNESS',
      'ROBOTS_TXT_MISSING',
    ]);
  });

  it('caps the stored URLs per task', () => {
    const urls = Array.from({ length: 80 }, (_, index) => `https://example.com/${index}`);
    const [task] = buildAuditTasks([{ ruleId: 'TITLE_MISSING', affectedUrls: urls }], 'EN');

    expect(task.affectedUrls).toHaveLength(50);
    expect(task.name).toBe('80 pages without a title tag');
  });

  it('marks classifier based findings as classifier tasks', () => {
    const [task] = buildAuditTasks([{ ruleId: 'LOW_TRUST', affectedUrls: ['https://example.com/a'] }], 'EN');

    expect(task.source).toBe('CLASSIFIER');
  });

  it('uses the finding count in the title and lists details under the recommendation', () => {
    const [task] = buildAuditTasks(
      [
        {
          ruleId: 'KEYWORD_NEAR_PAGE_ONE',
          affectedUrls: ['https://example.com/a'],
          count: 7,
          details: ['"kündigungsfrist": position 17, 60000 searches per month'],
        },
      ],
      'EN',
    );

    expect(task.name).toBe('7 relevant keywords are close to page 1 (positions 11 to 30)');
    expect(task.description).toContain('Often only a little is missing.');
    expect(task.description).toContain('\n\n- "kündigungsfrist": position 17, 60000 searches per month');
    expect(task).toMatchObject({ area: 'VISIBILITY', source: 'CLASSIFIER', priority: 'HIGH' });
  });
});
