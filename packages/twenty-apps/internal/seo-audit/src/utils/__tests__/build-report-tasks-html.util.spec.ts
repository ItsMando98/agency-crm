import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';
import { buildReportTasksHtml } from 'src/utils/build-report-tasks-html.util';

describe('buildReportTasksHtml', () => {
  it('groups tasks by horizon with priority, effort, area and source in text', () => {
    const html = buildReportTasksHtml(buildSeoAuditResult({ language: 'EN' }));

    expect(html).toContain('This week');
    expect(html).toContain('This month');
    expect(html).toContain('<strong>High</strong>');
    expect(html).toContain('Effort: Low');
    expect(html).toContain('1 internally linked pages no longer exist (4xx)');
    expect(html).toContain('<li>&quot;kündigungsfrist&quot;: position 17, 60000 searches per month</li>');
  });

  it('shows at most three URLs and counts the rest', () => {
    const urls = Array.from({ length: 8 }, (_, index) => `https://kanzlei-beispiel.de/p${index}`);
    const html = buildReportTasksHtml(
      buildSeoAuditResult({
        language: 'EN',
        tasks: buildAuditTasks([{ ruleId: 'MIXED_CONTENT', affectedUrls: urls }], 'EN'),
      }),
    );

    expect(html).toContain('https://kanzlei-beispiel.de/p2');
    expect(html).not.toContain('https://kanzlei-beispiel.de/p3');
    expect(html).toContain('and 5 more');
  });

  it('says so when there are no tasks', () => {
    expect(buildReportTasksHtml(buildSeoAuditResult({ language: 'EN', tasks: [] }))).toContain('No actions were found.');
  });

  it('escapes task text taken from crawled pages', () => {
    const html = buildReportTasksHtml(
      buildSeoAuditResult({
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
      }),
    );

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
