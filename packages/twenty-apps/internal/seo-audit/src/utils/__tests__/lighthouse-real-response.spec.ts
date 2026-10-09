import { describe, expect, it } from 'vitest';

import { DATAFORSEO_LIGHTHOUSE_RESPONSE } from 'src/__mocks__/dataforseo-lighthouse-response.mock';
import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';
import { checkCoreWebVitals } from 'src/utils/check-core-web-vitals.util';
import { parseLighthouse } from 'src/utils/parse-lighthouse.util';

const [task] = DATAFORSEO_LIGHTHOUSE_RESPONSE.tasks;
const lighthouse = parseLighthouse(task.result[0], 'https://fallback.example/');

describe('a real DataForSEO Lighthouse response', () => {
  it('is parsed into the measured values', () => {
    expect(lighthouse).toEqual({
      url: 'https://roaswell.com/',
      performanceScore: 65,
      largestContentfulPaintMs: 7138,
      cumulativeLayoutShift: 0,
      totalBlockingTimeMs: 182,
      fetchedAt: '2026-10-08T20:58:44.689Z',
    });
  });

  it('turns a slow main content into one critical task and ignores the good values', () => {
    const tasks = buildAuditTasks(checkCoreWebVitals({ lighthouse, language: 'DE' }), 'DE');

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      ruleId: 'LCP_VERY_SLOW',
      priority: 'HIGH',
      area: 'PERFORMANCE',
      source: 'RULE',
    });
    expect(tasks[0].description).toContain('https://roaswell.com/: LCP 7,1 s (Ziel: unter 2,5 s)');
  });
});
