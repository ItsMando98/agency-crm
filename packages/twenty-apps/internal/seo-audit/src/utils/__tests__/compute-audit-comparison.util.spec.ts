import { describe, expect, it } from 'vitest';

import { type ComparableAudit } from 'src/types/comparable-audit';
import { computeAuditComparison } from 'src/utils/compute-audit-comparison.util';

const buildAudit = (overrides: Partial<ComparableAudit>): ComparableAudit => ({
  score: 60,
  grade: 'C',
  areaScores: { ON_PAGE: 50, LINKS: 80 },
  organicKeywordCount: 100,
  estimatedMonthlyTraffic: 1000,
  backlinkCount: 200,
  referringDomainCount: 40,
  mobilePerformanceScore: null,
  mobileLcpMs: null,
  mobileCls: null,
  mobileTbtMs: null,
  aiPresenceRate: null,
  tasks: [],
  ...overrides,
});

describe('computeAuditComparison', () => {
  it('reports score and area deltas', () => {
    const comparison = computeAuditComparison(
      buildAudit({}),
      buildAudit({ score: 72, grade: 'B', areaScores: { ON_PAGE: 75, LINKS: 70 } }),
    );

    expect(comparison.score).toEqual({ previous: 60, current: 72, delta: 12 });
    expect(comparison.grade).toEqual({ previous: 'C', current: 'B' });
    expect(comparison.areaScores.ON_PAGE.delta).toBe(25);
    expect(comparison.areaScores.LINKS.delta).toBe(-10);
  });

  it('has no delta when one side is missing', () => {
    const comparison = computeAuditComparison(
      buildAudit({ organicKeywordCount: null }),
      buildAudit({ organicKeywordCount: 120, areaScores: { ON_PAGE: 50, LINKS: 80, VISIBILITY: 40 } }),
    );

    expect(comparison.market.organicKeywordCount).toEqual({ previous: null, current: 120, delta: null });
    expect(comparison.areaScores.VISIBILITY).toEqual({ previous: null, current: 40, delta: null });
  });

  it('compares the mobile speed values and rounds the layout shift', () => {
    const comparison = computeAuditComparison(
      buildAudit({ mobilePerformanceScore: 65, mobileLcpMs: 7138, mobileCls: 0.1, mobileTbtMs: 182 }),
      buildAudit({ mobilePerformanceScore: 82, mobileLcpMs: 2400, mobileCls: 0.07, mobileTbtMs: null }),
    );

    expect(comparison.mobileSpeed).toEqual({
      performanceScore: { previous: 65, current: 82, delta: 17 },
      largestContentfulPaintMs: { previous: 7138, current: 2400, delta: -4738 },
      cumulativeLayoutShift: { previous: 0.1, current: 0.07, delta: -0.03 },
      totalBlockingTimeMs: { previous: 182, current: null, delta: null },
    });
  });

  it('compares how often the AI assistants name the website', () => {
    const comparison = computeAuditComparison(
      buildAudit({ aiPresenceRate: 0.125 }),
      buildAudit({ aiPresenceRate: 0.375 }),
    );

    expect(comparison.aiPresenceRate).toEqual({ previous: 0.125, current: 0.375, delta: 0.25 });
  });

  it('warns that the overall score covers different areas when one audit has an area the other lacks', () => {
    const comparison = computeAuditComparison(
      buildAudit({ areaScores: { ON_PAGE: 50, LINKS: 80 } }),
      buildAudit({ areaScores: { ON_PAGE: 50, LINKS: 80, AI_VISIBILITY: 80, VISIBILITY: 40 } }),
    );

    expect(comparison.areasOnlyInOneAudit).toEqual(['AI_VISIBILITY', 'VISIBILITY']);
    expect(comparison.scoreNote).toBe(
      'The overall score of the two audits covers different areas (AI_VISIBILITY, VISIBILITY), so its change is only a rough indication. Compare the area scores instead.',
    );
  });

  it('has no warning when both audits cover the same areas', () => {
    const comparison = computeAuditComparison(buildAudit({}), buildAudit({ score: 70 }));

    expect(comparison.areasOnlyInOneAudit).toEqual([]);
    expect(comparison.scoreNote).toBeNull();
  });

  it('matches tasks by rule id', () => {
    const comparison = computeAuditComparison(
      buildAudit({
        tasks: [
          { ruleId: 'TITLE_MISSING', name: 'Add titles', priority: 'HIGH' },
          { ruleId: 'IMG_ALT', name: 'Add alt text', priority: 'LOW' },
        ],
      }),
      buildAudit({
        tasks: [
          { ruleId: 'IMG_ALT', name: 'Add alt text', priority: 'LOW' },
          { ruleId: 'HSTS', name: 'Enable HSTS', priority: 'MEDIUM' },
        ],
      }),
    );

    expect(comparison.resolvedTasks).toEqual([{ ruleId: 'TITLE_MISSING', name: 'Add titles', priority: 'HIGH' }]);
    expect(comparison.newTasks).toEqual([{ ruleId: 'HSTS', name: 'Enable HSTS', priority: 'MEDIUM' }]);
    expect(comparison.persistingTaskCount).toBe(1);
  });

  it('ignores tasks without a rule id', () => {
    const comparison = computeAuditComparison(
      buildAudit({ tasks: [{ ruleId: null, name: 'Old task', priority: 'LOW' }] }),
      buildAudit({ tasks: [] }),
    );

    expect(comparison.resolvedTasks).toEqual([]);
  });
});
