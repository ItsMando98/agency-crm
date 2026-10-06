// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  coreQuery: vi.fn(),
  coreMutation: vi.fn(),
  enqueueSnackbar: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: mocks.coreQuery, mutation: mocks.coreMutation };
  }),
}));
vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: mocks.enqueueSnackbar,
  navigate: mocks.navigate,
  AppPath: {
    RecordShowPage: '/object/:objectNameSingular/:objectRecordId',
    RecordIndexPage: '/objects/:objectNamePlural',
  },
}));

import { AgencyDesk } from 'src/front-components/components/AgencyDesk';

const PAYMENT_APPROVAL = {
  id: 'ap-1',
  name: 'Pay invoice 42',
  category: 'PAYMENT',
  summary: 'Supplier invoice is due on Friday.',
  proposedAction: 'Transfer 1,200 EUR to the supplier.',
  agentTask: { id: 'task-1', name: 'Settle supplier invoices' },
};
const CALL_APPROVAL = {
  id: 'ap-2',
  name: 'Call the client',
  category: 'CALL',
  summary: null,
  proposedAction: null,
  agentTask: null,
};

const givenDesk = ({
  approvals = [PAYMENT_APPROVAL, CALL_APPROVAL] as unknown[],
  counts = {} as Record<string, number>,
} = {}) => {
  mocks.coreQuery.mockImplementation(
    async (query: {
      approvals?: unknown;
      agentTasks?: { __args: { filter: { status: { eq: string } } } };
    }) =>
      query.approvals !== undefined
        ? { approvals: { edges: approvals.map((node) => ({ node })) } }
        : {
            agentTasks: {
              totalCount: counts[query.agentTasks?.__args.filter.status.eq ?? ''] ?? 0,
            },
          },
  );
  mocks.coreMutation.mockResolvedValue({ updateApproval: { id: 'ap-1' } });
  mocks.navigate.mockResolvedValue(undefined);
};

const findCard = (name: string) => screen.findByRole('article', { name });

describe('AgencyDesk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('lists every pending approval with its context', async () => {
    givenDesk();
    render(<AgencyDesk />);

    const card = within(await findCard('Pay invoice 42'));

    expect(card.getByText('Payment')).toBeTruthy();
    expect(card.getByText('Supplier invoice is due on Friday.')).toBeTruthy();
    expect(card.getByText('Transfer 1,200 EUR to the supplier.')).toBeTruthy();
    expect(card.getByText(/Settle supplier invoices/)).toBeTruthy();
    expect(screen.getByText('2 waiting. The oldest is first.')).toBeTruthy();
    expect(await findCard('Call the client')).toBeTruthy();
  });

  it('approves with a trimmed note and removes the card', async () => {
    givenDesk();
    const user = userEvent.setup();

    render(<AgencyDesk />);

    const card = within(await findCard('Pay invoice 42'));

    await user.type(card.getByLabelText('Decision note for Pay invoice 42'), '  Looks fine ');
    await user.click(card.getByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(mocks.coreMutation).toHaveBeenCalledWith({
        updateApproval: {
          __args: {
            id: 'ap-1',
            data: { status: 'APPROVED', decisionNote: 'Looks fine' },
          },
          id: true,
        },
      }),
    );
    await waitFor(() => expect(screen.queryByText('Pay invoice 42')).toBeNull());
    expect(screen.getByText('1 waiting. The oldest is first.')).toBeTruthy();
    expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success' }),
    );
  });

  it('rejects without a note and only sends the status', async () => {
    givenDesk();
    const user = userEvent.setup();

    render(<AgencyDesk />);

    const card = within(await findCard('Call the client'));

    await user.click(card.getByRole('button', { name: 'Reject' }));

    await waitFor(() =>
      expect(mocks.coreMutation).toHaveBeenCalledWith({
        updateApproval: {
          __args: { id: 'ap-2', data: { status: 'REJECTED' } },
          id: true,
        },
      }),
    );
    await waitFor(() => expect(screen.queryByText('Call the client')).toBeNull());
  });

  it('keeps the card and reports the problem when saving fails', async () => {
    givenDesk();
    mocks.coreMutation.mockRejectedValue(new Error('forbidden'));
    const user = userEvent.setup();

    render(<AgencyDesk />);

    const card = within(await findCard('Pay invoice 42'));

    await user.click(card.getByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
          message: 'The decision could not be saved. Please try again.',
        }),
      ),
    );
    expect(screen.getByText('Pay invoice 42')).toBeTruthy();
    expect(
      (card.getByRole('button', { name: 'Approve' }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it('says so when nothing is waiting', async () => {
    givenDesk({ approvals: [] });
    render(<AgencyDesk />);

    expect(
      await screen.findByText('Nothing is waiting for you. Agents carry on by themselves.'),
    ).toBeTruthy();
    expect(screen.queryByRole('article')).toBeNull();
  });

  it('shows how many tasks sit in each status', async () => {
    givenDesk({ counts: { WAITING_APPROVAL: 3, QUEUED: 5, FAILED: 1 } });
    render(<AgencyDesk />);

    expect(await screen.findByRole('button', { name: 'Needs input: 3 tasks' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Queued: 5 tasks' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Failed: 1 tasks' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Running: 0 tasks' })).toBeTruthy();
  });

  it('opens the approval record from its title', async () => {
    givenDesk();
    const user = userEvent.setup();

    render(<AgencyDesk />);

    await user.click(await screen.findByRole('button', { name: 'Open Pay invoice 42' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/object/:objectNameSingular/:objectRecordId', {
      objectNameSingular: 'approval',
      objectRecordId: 'ap-1',
    });
  });

  it('opens the task list from a queue tile', async () => {
    givenDesk({ counts: { QUEUED: 2 } });
    const user = userEvent.setup();

    render(<AgencyDesk />);

    await user.click(await screen.findByRole('button', { name: 'Queued: 2 tasks' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/objects/:objectNamePlural', {
      objectNamePlural: 'agentTasks',
    });
  });

  it('highlights a queue tile while the pointer is over it', async () => {
    givenDesk({ counts: { QUEUED: 2 } });
    const user = userEvent.setup();

    render(<AgencyDesk />);

    const tile = await screen.findByRole('button', { name: 'Queued: 2 tasks' });

    expect(tile.getAttribute('style')).not.toContain('background-transparent-lighter');

    await user.hover(tile);
    expect(tile.getAttribute('style')).toContain('background-transparent-lighter');

    await user.unhover(tile);
    expect(tile.getAttribute('style')).not.toContain('background-transparent-lighter');
  });

  it('shows an error when approvals cannot be loaded but keeps the queue', async () => {
    givenDesk({ counts: { QUEUED: 2 } });
    mocks.coreQuery.mockImplementation(async (query: { approvals?: unknown }) => {
      if (query.approvals !== undefined) {
        throw new Error('network');
      }

      return { agentTasks: { totalCount: 2 } };
    });

    render(<AgencyDesk />);

    expect(await screen.findByText('Approvals could not be loaded')).toBeTruthy();
    expect(screen.getByText('Agent queue')).toBeTruthy();
  });
});
