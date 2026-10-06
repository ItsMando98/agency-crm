import { useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { AGENT_TASK_STATUS } from 'src/constants/agency-ops.constants';

export type AgentTaskStatus = keyof typeof AGENT_TASK_STATUS;
export type AgentTaskCounts = Record<AgentTaskStatus, number>;

const AGENT_TASK_STATUSES = Object.values(AGENT_TASK_STATUS);

type AgentTaskCountsState = {
  counts: AgentTaskCounts | undefined;
  isLoading: boolean;
  hasError: boolean;
  refresh: () => void;
};

export const useAgentTaskCounts = (): AgentTaskCountsState => {
  const [counts, setCounts] = useState<AgentTaskCounts | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const fetchCounts = async () => {
      try {
        const client = new CoreApiClient();
        const results = await Promise.all(
          AGENT_TASK_STATUSES.map((status) =>
            client.query({
              agentTasks: {
                __args: { filter: { status: { eq: status } } },
                totalCount: true,
              },
            }),
          ),
        );

        if (isCancelled) {
          return;
        }

        setCounts(
          Object.fromEntries(
            AGENT_TASK_STATUSES.map((status, index) => [
              status,
              results[index].agentTasks?.totalCount ?? 0,
            ]),
          ) as AgentTaskCounts,
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

    fetchCounts();

    return () => {
      isCancelled = true;
    };
  }, [refreshCounter]);

  const refresh = useCallback(
    () => setRefreshCounter((counter) => counter + 1),
    [],
  );

  return { counts, isLoading, hasError, refresh };
};
