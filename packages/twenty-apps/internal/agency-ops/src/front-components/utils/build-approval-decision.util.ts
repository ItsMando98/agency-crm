import { APPROVAL_STATUS } from 'src/constants/agency-ops.constants';

export type ApprovalDecision =
  | typeof APPROVAL_STATUS.APPROVED
  | typeof APPROVAL_STATUS.REJECTED;

type ApprovalDecisionData = {
  status: ApprovalDecision;
  decisionNote?: string;
};

// decidedAt and the task status are set by the approval-decided logic function.
export const buildApprovalDecisionData = (
  decision: ApprovalDecision,
  note: string,
): ApprovalDecisionData => {
  const trimmedNote = note.trim();

  return trimmedNote === ''
    ? { status: decision }
    : { status: decision, decisionNote: trimmedNote };
};
