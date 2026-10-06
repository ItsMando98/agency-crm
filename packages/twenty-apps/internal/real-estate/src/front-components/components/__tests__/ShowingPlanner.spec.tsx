// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  coreQuery: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: mocks.coreQuery };
  }),
}));
vi.mock('twenty-sdk/front-component', () => ({
  navigate: mocks.navigate,
  AppPath: { RecordShowPage: '/object/:objectNameSingular/:objectRecordId' },
}));

import { ShowingPlanner } from 'src/front-components/components/ShowingPlanner';

const daysFromNow = (days: number, hour: number): string => {
  const date = new Date();

  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);

  return date.toISOString();
};

const UPCOMING_SHOWING = {
  id: 's1',
  scheduledAt: daysFromNow(1, 10),
  status: 'SCHEDULED',
  property: { id: 'p1', name: 'Rosenweg 5' },
  buyer: { id: 'b1', name: { firstName: 'Anna', lastName: 'Keller' } },
  agent: { id: 'a1', name: { firstName: 'Max', lastName: 'Berg' } },
};
const OVERDUE_SHOWING = {
  id: 's2',
  scheduledAt: daysFromNow(-1, 10),
  status: 'SCHEDULED',
  property: { id: 'p2', name: 'Lindenallee 2' },
  buyer: null,
  agent: null,
};
const UNRATED_SHOWING = {
  id: 's3',
  scheduledAt: daysFromNow(-2, 10),
  status: 'COMPLETED',
  interestLevel: null,
  property: { id: 'p3', name: 'Gartenstrasse 9' },
};
const RATED_SHOWING = {
  id: 's4',
  scheduledAt: daysFromNow(-3, 10),
  status: 'COMPLETED',
  interestLevel: 'RATING_4',
  property: { id: 'p4', name: 'Bergblick 1' },
};
const CANCELLED_SHOWING = {
  id: 's5',
  scheduledAt: daysFromNow(-4, 10),
  status: 'CANCELLED',
  property: { id: 'p5', name: 'Seestrasse 7' },
};

const givenShowings = ({
  upcoming = [UPCOMING_SHOWING] as unknown[],
  past = [OVERDUE_SHOWING, UNRATED_SHOWING, RATED_SHOWING, CANCELLED_SHOWING] as unknown[],
} = {}) => {
  mocks.coreQuery.mockImplementation(
    async (query: { showings: { __args: { filter: { status?: unknown } } } }) => ({
      showings: {
        edges: (query.showings.__args.filter.status !== undefined ? upcoming : past).map(
          (node) => ({ node }),
        ),
      },
    }),
  );
  mocks.navigate.mockResolvedValue(undefined);
};

describe('ShowingPlanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('groups upcoming showings by day and names the people involved', async () => {
    givenShowings();
    render(<ShowingPlanner />);

    const day = within(await screen.findByRole('group', { name: 'Tomorrow' }));

    expect(day.getByText('Rosenweg 5')).toBeTruthy();
    expect(day.getByText('Anna Keller with Max Berg')).toBeTruthy();
    expect(day.getByText(/\d{1,2}:\d{2}/)).toBeTruthy();
    expect(screen.getByText('1 scheduled')).toBeTruthy();
  });

  it('lists past showings that still need an outcome or a buyer rating', async () => {
    givenShowings();
    render(<ShowingPlanner />);

    const overdue = within(await screen.findByRole('button', { name: 'Open showing at Lindenallee 2' }));
    const unrated = within(screen.getByRole('button', { name: 'Open showing at Gartenstrasse 9' }));

    expect(overdue.getByText('Outcome still open')).toBeTruthy();
    expect(overdue.getByText('Unknown buyer with No agent')).toBeTruthy();
    expect(unrated.getByText('Buyer interest missing')).toBeTruthy();
    expect(screen.queryByText('Bergblick 1')).toBeNull();
    expect(screen.queryByText('Seestrasse 7')).toBeNull();
    expect(screen.getByText('2 past showings need an update')).toBeTruthy();
  });

  it('shows friendly empty states', async () => {
    givenShowings({ upcoming: [], past: [] });
    render(<ShowingPlanner />);

    expect(await screen.findByText(/No showings are scheduled/)).toBeTruthy();
    expect(screen.getByText('Everything is up to date.')).toBeTruthy();
  });

  it('opens the showing record when a row is clicked', async () => {
    givenShowings();
    const user = userEvent.setup();

    render(<ShowingPlanner />);

    await user.click(await screen.findByRole('button', { name: 'Open showing at Rosenweg 5' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/object/:objectNameSingular/:objectRecordId', {
      objectNameSingular: 'showing',
      objectRecordId: 's1',
    });
  });

  it('highlights a row while the pointer is over it', async () => {
    givenShowings();
    const user = userEvent.setup();

    render(<ShowingPlanner />);

    const row = await screen.findByRole('button', { name: 'Open showing at Rosenweg 5' });

    expect(row.getAttribute('style')).not.toContain('background-transparent-lighter');

    await user.hover(row);
    expect(row.getAttribute('style')).toContain('background-transparent-lighter');

    await user.unhover(row);
    expect(row.getAttribute('style')).not.toContain('background-transparent-lighter');
  });

  it('shows an error when the showings cannot be loaded', async () => {
    mocks.coreQuery.mockRejectedValue(new Error('network'));

    render(<ShowingPlanner />);

    expect(await screen.findByText('The planner could not be loaded')).toBeTruthy();
  });
});
