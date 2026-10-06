import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type ShowingSummary } from 'src/front-components/types/showing-summary';
import { getFollowUpReason } from 'src/front-components/utils/get-follow-up-reason.util';

const UPCOMING_SHOWINGS_LIMIT = 15;
const RECENT_PAST_SHOWINGS_LIMIT = 40;
const FOLLOW_UP_DISPLAY_LIMIT = 8;

const PERSON_FIELDS = { id: true, name: { firstName: true, lastName: true } } as const;
const SHOWING_FIELDS = {
  id: true,
  name: true,
  scheduledAt: true,
  status: true,
  interestLevel: true,
  property: { id: true, name: true },
  buyer: PERSON_FIELDS,
  agent: PERSON_FIELDS,
} as const;

type ShowingPlannerState = {
  upcomingShowings: ShowingSummary[];
  followUpShowings: ShowingSummary[];
  isLoading: boolean;
  hasError: boolean;
};

const INITIAL_STATE: ShowingPlannerState = {
  upcomingShowings: [],
  followUpShowings: [],
  isLoading: true,
  hasError: false,
};

export const useShowingPlanner = (): ShowingPlannerState => {
  const [state, setState] = useState<ShowingPlannerState>(INITIAL_STATE);

  useEffect(() => {
    let isCancelled = false;

    const fetchShowings = async () => {
      try {
        const client = new CoreApiClient();
        const nowIso = new Date().toISOString();
        const [upcoming, past] = await Promise.all([
          client.query({
            showings: {
              __args: {
                first: UPCOMING_SHOWINGS_LIMIT,
                filter: {
                  status: { eq: 'SCHEDULED' },
                  scheduledAt: { gte: nowIso },
                },
                orderBy: [{ scheduledAt: 'AscNullsLast' }],
              },
              edges: { node: SHOWING_FIELDS },
            },
          }),
          client.query({
            showings: {
              __args: {
                first: RECENT_PAST_SHOWINGS_LIMIT,
                filter: { scheduledAt: { lt: nowIso } },
                orderBy: [{ scheduledAt: 'DescNullsLast' }],
              },
              edges: { node: SHOWING_FIELDS },
            },
          }),
        ]);

        if (isCancelled) {
          return;
        }

        const toShowings = (edges: { node: ShowingSummary }[] | undefined) =>
          (edges ?? []).map((edge) => edge.node);

        setState({
          upcomingShowings: toShowings(upcoming.showings?.edges),
          followUpShowings: toShowings(past.showings?.edges)
            .filter((showing) => getFollowUpReason(showing) !== null)
            .slice(0, FOLLOW_UP_DISPLAY_LIMIT),
          isLoading: false,
          hasError: false,
        });
      } catch {
        if (!isCancelled) {
          setState({ ...INITIAL_STATE, isLoading: false, hasError: true });
        }
      }
    };

    fetchShowings();

    return () => {
      isCancelled = true;
    };
  }, []);

  return state;
};
