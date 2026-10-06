import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

import { APPROVAL_STATUS } from 'src/constants/agency-ops.constants';
import { ApprovalCard } from 'src/front-components/components/ApprovalCard';
import { useDecideApproval } from 'src/front-components/hooks/use-decide-approval';
import { type PendingApproval } from 'src/front-components/types/pending-approval';
import { type ApprovalDecision } from 'src/front-components/utils/build-approval-decision.util';

type ApprovalInboxProps = {
  approvals: PendingApproval[];
  onApprovalDecided: (approvalId: string) => void;
};

const getInboxDescription = (approvalCount: number): string =>
  approvalCount === 0
    ? 'Nothing is waiting for you. Agents carry on by themselves.'
    : `${approvalCount} waiting. The oldest is first.`;

export const ApprovalInbox = ({ approvals, onApprovalDecided }: ApprovalInboxProps) => {
  const { decideApproval, decidingApprovalId } = useDecideApproval();

  const handleDecide = async ({
    approvalId,
    decision,
    note,
  }: {
    approvalId: string;
    decision: ApprovalDecision;
    note: string;
  }) => {
    const isDecided = await decideApproval({ approvalId, decision, note });

    if (!isDecided) {
      enqueueSnackbar({
        message: 'The decision could not be saved. Please try again.',
        variant: 'error',
      });

      return;
    }

    onApprovalDecided(approvalId);
    enqueueSnackbar({
      message:
        decision === APPROVAL_STATUS.APPROVED
          ? 'Approved. The agent picks the task up again.'
          : 'Rejected. The task was cancelled.',
      variant: 'success',
    });
  };

  return (
    <Section.Root>
      <Section.Header
        title="Needs your decision"
        description={getInboxDescription(approvals.length)}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[3] }}>
        {approvals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            isBusy={decidingApprovalId !== undefined}
            onDecide={handleDecide}
          />
        ))}
      </div>
    </Section.Root>
  );
};
