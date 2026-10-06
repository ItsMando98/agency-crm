import { useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  type ApprovalDecision,
  buildApprovalDecisionData,
} from 'src/front-components/utils/build-approval-decision.util';

type DecideApprovalParams = {
  approvalId: string;
  decision: ApprovalDecision;
  note: string;
};

export const useDecideApproval = () => {
  const [decidingApprovalId, setDecidingApprovalId] = useState<string | undefined>(
    undefined,
  );

  const decideApproval = async ({
    approvalId,
    decision,
    note,
  }: DecideApprovalParams): Promise<boolean> => {
    setDecidingApprovalId(approvalId);

    try {
      const client = new CoreApiClient();

      await client.mutation({
        updateApproval: {
          __args: {
            id: approvalId,
            data: buildApprovalDecisionData(decision, note),
          },
          id: true,
        },
      });

      return true;
    } catch {
      return false;
    } finally {
      setDecidingApprovalId(undefined);
    }
  };

  return { decideApproval, decidingApprovalId };
};
