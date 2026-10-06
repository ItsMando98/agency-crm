import { describe, expect, it } from 'vitest';

import { type ShowingSummary } from 'src/front-components/types/showing-summary';
import { groupShowingsByDay } from 'src/front-components/utils/group-showings-by-day.util';

const NOW = new Date(2026, 9, 6, 9, 0);

const showingAt = (id: string, date: Date): ShowingSummary => ({
  id,
  scheduledAt: date.toISOString(),
});

describe('groupShowingsByDay', () => {
  it('labels today and tomorrow and spells out later days', () => {
    const groups = groupShowingsByDay(
      [
        showingAt('later', new Date(2026, 9, 9, 10, 0)),
        showingAt('today', new Date(2026, 9, 6, 15, 0)),
        showingAt('tomorrow', new Date(2026, 9, 7, 10, 0)),
      ],
      NOW,
      'en-US',
    );

    expect(groups.map((group) => group.label)).toEqual([
      'Today',
      'Tomorrow',
      'Friday, October 9',
    ]);
  });

  it('sorts showings within a day by time', () => {
    const groups = groupShowingsByDay(
      [
        showingAt('afternoon', new Date(2026, 9, 6, 15, 0)),
        showingAt('morning', new Date(2026, 9, 6, 11, 0)),
      ],
      NOW,
      'en-US',
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].showings.map((showing) => showing.id)).toEqual([
      'morning',
      'afternoon',
    ]);
  });

  it('skips showings without a valid date', () => {
    const groups = groupShowingsByDay(
      [
        { id: 'missing', scheduledAt: null },
        { id: 'broken', scheduledAt: 'not a date' },
        showingAt('valid', new Date(2026, 9, 6, 15, 0)),
      ],
      NOW,
      'en-US',
    );

    expect(groups.flatMap((group) => group.showings.map((showing) => showing.id))).toEqual([
      'valid',
    ]);
  });

  it('does not change the list it was given', () => {
    const showings = [
      showingAt('afternoon', new Date(2026, 9, 6, 15, 0)),
      showingAt('morning', new Date(2026, 9, 6, 11, 0)),
    ];

    groupShowingsByDay(showings, NOW, 'en-US');

    expect(showings.map((showing) => showing.id)).toEqual(['afternoon', 'morning']);
  });

  it('returns no groups for an empty list', () => {
    expect(groupShowingsByDay([], NOW, 'en-US')).toEqual([]);
  });
});
