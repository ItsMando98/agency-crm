import { useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { APPROVAL_STATUS } from 'src/constants/agency-ops.constants';
import { type PendingApproval } from 'src/front-components/types/pending-approval';

const PENDING_APPROVALS_LIMIT = 50;

type PendingApprovalsState = {
  approvals: PendingApproval[];
  isLoading: boolean;
  hasError: boolean;
  removeApproval: (approvalId: string) => void;
  refresh: () => void;
};

export const usePendingApprovals = (): PendingApprovalsState => {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const fetchApprovals = async () => {
      try {
        const client = new CoreApiClient();
        const result = await client.query({
          approvals: {
            __args: {
              first: PENDING_APPROVALS_LIMIT,
              filter: { status: { eq: APPROVAL_STATUS.PENDING } },
              orderBy: [{ createdAt: 'AscNullsLast' }],
            },
            edges: {
              node: {
                id: true,
                name: true,
                category: true,
                summary: true,
                proposedAction: true,
                agentTask: { id: true, name: true },
              },
            },
          },
        });

        if (isCancelled) {
          return;
        }

        setApprovals(
          (result.approvals?.edges ?? []).map(
            (edge: { node: PendingApproval }) => edge.node,
          ),
        );
        setHasError(false);
      } catch {
        if (!isCancelled) {
          setHasError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchApprovals();

    return () => {
      isCancelled = true;
    };
  }, [refreshCounter]);

  const removeApproval = useCallback(
    (approvalId: string) =>
      setApprovals((previous) =>
        previous.filter((approval) => approval.id !== approvalId),
      ),
    [],
  );
  const refresh = useCallback(
    () => setRefreshCounter((counter) => counter + 1),
    [],
  );

  return { approvals, isLoading, hasError, removeApproval, refresh };
};
