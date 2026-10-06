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
