import { describe, expect, it } from 'vitest';

import { describeStrength } from '~/lib/describe-strength';
import { insightsSchema } from '~/lib/twenty/audit-types';

describe('describeStrength', () => {
  it('writes a sentence for each kind', () => {
    expect(
      describeStrength({ kind: 'STRONG_AREAS', areas: [{ area: 'SECURITY', score: 98 }] }),
    ).toBe('Stark aufgestellt: Sicherheit (98).');
    expect(
      describeStrength({
        kind: 'TOP_RANKINGS',
        count: 2,
        examples: [{ keyword: 'kündigung', position: 2, searchVolume: 90000 }],
      }),
    ).toContain('auf Platz 2 mit 90.000 Suchen im Monat');
    expect(describeStrength({ kind: 'HELPFUL_PAGES', count: 3, total: 10 })).toContain('3 von 10');
    expect(describeStrength({ kind: 'AI_PRESENCE', ratePercent: 60, queriesTested: 8 })).toContain('60 %');
  });
});

describe('insightsSchema', () => {
  it('reads what the app stores and drops strengths it does not know', () => {
    const parsed = insightsSchema.parse({
      rulesOnlyScore: 91,
      confidence: { total: 10, definitive: 7, sharePercent: 70 },
      strengths: [{ kind: 'HELPFUL_PAGES', count: 1, total: 2 }, { kind: 'FUTURE_KIND' }],
      summary: {
        model: 'claude-opus-5-5',
        headline: { text: 'Gut.', unverifiedNumbers: [] },
        blockers: [{ text: 'Es gibt 777 Fehler.', unverifiedNumbers: ['777'] }],
        isFullyVerified: false,
      },
    });

    expect(parsed.strengths).toEqual([{ kind: 'HELPFUL_PAGES', count: 1, total: 2 }]);
    expect(parsed.summary?.blockers[0]?.unverifiedNumbers).toEqual(['777']);
    expect(parsed.summary?.thisWeek).toEqual([]);
    expect(parsed.competingPages).toEqual([]);
  });

  it('accepts an audit that has no insights yet', () => {
    expect(insightsSchema.safeParse({}).success).toBe(true);
    expect(insightsSchema.safeParse(null).success).toBe(false);
  });
});
