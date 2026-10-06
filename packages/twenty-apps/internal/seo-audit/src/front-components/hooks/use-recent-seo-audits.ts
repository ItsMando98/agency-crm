import { useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { type RecentSeoAudit } from 'src/front-components/types/recent-seo-audit';

const RECENT_AUDITS_LIMIT = 5;

type RecentSeoAuditsState = {
  recentAudits: RecentSeoAudit[];
  hasFinishedAudit: boolean;
  isLoading: boolean;
  refresh: () => void;
};

export const useRecentSeoAudits = (): RecentSeoAuditsState => {
  const [recentAudits, setRecentAudits] = useState<RecentSeoAudit[]>([]);
  const [hasFinishedAudit, setHasFinishedAudit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const fetchAudits = async () => {
      try {
        const client = new CoreApiClient();
        const [recent, finished] = await Promise.all([
          client.query({
            seoAudits: {
              __args: {
                first: RECENT_AUDITS_LIMIT,
                orderBy: [{ createdAt: 'DescNullsLast' }],
              },
              edges: {
                node: {
                  id: true,
                  name: true,
                  domain: true,
                  status: true,
                  score: true,
                  grade: true,
                },
              },
            },
          }),
          client.query({
            seoAudits: {
              __args: { first: 1, filter: { status: { eq: SEO_AUDIT_STATUS.DONE } } },
              edges: { node: { id: true } },
            },
          }),
        ]);

        if (isCancelled) {
          return;
        }

        setRecentAudits(
          (recent.seoAudits?.edges ?? []).map(
            (edge: { node: RecentSeoAudit }) => edge.node,
          ),
        );
        setHasFinishedAudit((finished.seoAudits?.edges ?? []).length > 0);
      } catch {
        if (!isCancelled) {
          setRecentAudits([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAudits();

    return () => {
      isCancelled = true;
    };
  }, [refreshCounter]);

  const refresh = useCallback(() => setRefreshCounter((counter) => counter + 1), []);

  return { recentAudits, hasFinishedAudit, isLoading, refresh };
};
