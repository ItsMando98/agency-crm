import { useState } from 'react';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { APPROVAL_STATUS } from 'src/constants/agency-ops.constants';
import { RowButton } from 'src/front-components/components/RowButton';
import {
  APPROVAL_CATEGORY_PRESENTATION,
  FALLBACK_CATEGORY_PRESENTATION,
} from 'src/front-components/constants/desk-presentation.const';
import { type PendingApproval } from 'src/front-components/types/pending-approval';
import { type ApprovalDecision } from 'src/front-components/utils/build-approval-decision.util';

type ApprovalCardProps = {
  approval: PendingApproval;
  isBusy: boolean;
  onDecide: (params: {
    approvalId: string;
    decision: ApprovalDecision;
    note: string;
  }) => Promise<void>;
};

export const ApprovalCard = ({ approval, isBusy, onDecide }: ApprovalCardProps) => {
  const [note, setNote] = useState('');
  const [pendingDecision, setPendingDecision] = useState<ApprovalDecision | undefined>(
    undefined,
  );
  const category =
    APPROVAL_CATEGORY_PRESENTATION[approval.category ?? ''] ??
    FALLBACK_CATEGORY_PRESENTATION;
  const title = approval.name ?? 'Approval';

  const decide = async (decision: ApprovalDecision) => {
    setPendingDecision(decision);
    await onDecide({ approvalId: approval.id, decision, note });
    setPendingDecision(undefined);
  };

  return (
    <article
      aria-label={title}
      style={{
        border: `1px solid ${themeCssVariables.border.color.medium}`,
        borderRadius: themeCssVariables.border.radius.md,
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[3],
        padding: themeCssVariables.spacing[3],
      }}
    >
      <RowButton
        ariaLabel={`Open ${title}`}
        onClick={() =>
          navigate(AppPath.RecordShowPage, {
            objectNameSingular: 'approval',
            objectRecordId: approval.id,
          })
        }
      >
        <span style={{ fontWeight: themeCssVariables.font.weight.medium }}>{title}</span>
        <Status color={category.color}>{category.label}</Status>
      </RowButton>
      {approval.agentTask && (
        <span
          style={{
            color: themeCssVariables.font.color.tertiary,
            fontSize: themeCssVariables.font.size.sm,
          }}
        >
          Waiting task: {approval.agentTask.name ?? 'Untitled task'}
        </span>
      )}
      {approval.summary && (
        <span style={{ color: themeCssVariables.font.color.secondary }}>{approval.summary}</span>
      )}
      {approval.proposedAction && (
        <div
          style={{
            background: themeCssVariables.background.transparent.lighter,
            borderRadius: themeCssVariables.border.radius.sm,
            display: 'flex',
            flexDirection: 'column',
            gap: themeCssVariables.spacing[1],
            padding: themeCssVariables.spacing[2],
          }}
        >
          <span
            style={{
              color: themeCssVariables.font.color.tertiary,
              fontSize: themeCssVariables.font.size.xs,
              fontWeight: themeCssVariables.font.weight.medium,
            }}
          >
            Will happen once approved
          </span>
          <span>{approval.proposedAction}</span>
        </div>
      )}
      <Input
        aria-label={`Decision note for ${title}`}
        placeholder="Decision note (optional, shown to the agent)"
        value={note}
        disabled={isBusy}
        onChange={(event) => setNote(event.target.value)}
      />
      <div style={{ display: 'flex', gap: themeCssVariables.spacing[2], justifyContent: 'flex-end' }}>
        <Button
          variant="outline"
          color="danger"
          startIcon={<IconX size={16} />}
          loading={pendingDecision === APPROVAL_STATUS.REJECTED}
          disabled={isBusy}
          onClick={() => decide(APPROVAL_STATUS.REJECTED)}
        >
          Reject
        </Button>
        <Button
          variant="solid"
          color="accent"
          startIcon={<IconCheck size={16} />}
          loading={pendingDecision === APPROVAL_STATUS.APPROVED}
          disabled={isBusy}
          onClick={() => decide(APPROVAL_STATUS.APPROVED)}
        >
          Approve
        </Button>
      </div>
    </article>
  );
};
