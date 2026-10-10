import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';
import { buildReportTasksSection } from 'src/utils/build-report-tasks-html.util';

const render = (overrides: Parameters<typeof buildSeoAuditResult>[0]): string =>
  buildReportTasksSection(buildSeoAuditResult(overrides))?.body ?? '';

describe('buildReportTasksSection', () => {
  it('renders each task with priority, area, effort, source and horizon as text', () => {
    const body = render({ language: 'EN' });

    expect(body).toContain('class="finding');
    expect(body).toContain('Effort: Low');
    expect(body).toContain('This week');
    expect(body).toContain('1 internally linked pages no longer exist (4xx)');
    expect(body).toContain('<li>&quot;kündigungsfrist&quot;: position 17, 60000 searches per month</li>');
  });

  it('shows at most three URLs and counts the rest', () => {
    const urls = Array.from({ length: 8 }, (_, index) => `https://kanzlei-beispiel.de/p${index}`);
    const body = render({
      language: 'EN',
      tasks: buildAuditTasks([{ ruleId: 'MIXED_CONTENT', affectedUrls: urls }], 'EN'),
    });

    expect(body).toContain('https://kanzlei-beispiel.de/p2');
    expect(body).not.toContain('https://kanzlei-beispiel.de/p3');
    expect(body).toContain('and 5 more');
  });

  it('lists tasks beyond the detailed ones in a compact table', () => {
    const tasks = Array.from({ length: 15 }, () => buildSeoAuditResult({ language: 'EN' }).tasks[0]);
    const body = render({ language: 'EN', tasks });

    expect(body.match(/class="finding/g)).toHaveLength(12);
    expect(body).toContain('More actions');
    expect(body).toContain('<td class="num">13</td>');
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
