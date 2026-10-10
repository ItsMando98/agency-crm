import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';
import { buildReportTasksSection } from 'src/utils/build-report-tasks-html.util';

const render = (overrides: Parameters<typeof buildSeoAuditResult>[0]): string =>
  buildReportTasksSection(buildSeoAuditResult(overrides))?.body ?? '';

describe('buildReportTasksSection', () => {
  it('names the problem and what it costs, but not the steps to fix it', () => {
    const body = render({ language: 'EN' });

    expect(body).toContain('class="finding');
    expect(body).toContain('Why it matters');
    expect(body).toContain('1 internally linked pages no longer exist (4xx)');
    expect(body).not.toContain('Effort');
    expect(body).not.toContain('position 17, 60000 searches per month');
  });

  it('shows at most two example URLs and counts the rest', () => {
    const urls = Array.from({ length: 8 }, (_, index) => `https://kanzlei-beispiel.de/p${index}`);
    const body = render({
      language: 'EN',
      tasks: buildAuditTasks([{ ruleId: 'MIXED_CONTENT', affectedUrls: urls }], 'EN'),
    });

    expect(body).toContain('https://kanzlei-beispiel.de/p1');
    expect(body).not.toContain('https://kanzlei-beispiel.de/p2');
    expect(body).toContain('and 6 more');
  });

  it('groups the points beyond the detailed ones by area without naming them', () => {
    const [task] = buildSeoAuditResult({ language: 'EN' }).tasks;
    const tasks = Array.from({ length: 10 }, (_, index) => ({ ...task, name: `Distinct finding ${index}` }));
    const body = render({ language: 'EN', tasks });

    expect(body.match(/class="finding/g)).toHaveLength(6);
    expect(body).toContain('There are 4 more points in 1 area.');
    expect(body).not.toContain('Distinct finding 6');
  });

  it('says so when there are no tasks', () => {
    const section = buildReportTasksSection(buildSeoAuditResult({ language: 'EN', tasks: [] }));

    expect(section?.lead).toBe('No actions were found.');
  });

  it('escapes task text taken from crawled pages', () => {
    const body = render({
      language: 'EN',
      tasks: [
        {
          ruleId: 'TITLE_MISSING',
          name: '<script>alert(1)</script>',
          description: 'Fix',
          priority: 'HIGH',
          effort: 'LOW',
          area: 'ON_PAGE',
          source: 'RULE',
          affectedUrls: ['https://x.test/"><script>alert(2)</script>'],
        },
      ],
    });

    expect(body).not.toContain('<script>');
    expect(body).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
