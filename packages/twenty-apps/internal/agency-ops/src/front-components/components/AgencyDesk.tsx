import 'twenty-ui/style.css';

import { Callout } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

import { ApprovalInbox } from 'src/front-components/components/ApprovalInbox';
import { TaskQueueOverview } from 'src/front-components/components/TaskQueueOverview';
import { useAgentTaskCounts } from 'src/front-components/hooks/use-agent-task-counts';
import { usePendingApprovals } from 'src/front-components/hooks/use-pending-approvals';

export const AgencyDesk = () => {
  const approvalState = usePendingApprovals();
  const taskCountState = useAgentTaskCounts();

  if (approvalState.isLoading || taskCountState.isLoading) {
    return <Callout variant="neutral" title="Loading the desk" />;
  }

  const handleApprovalDecided = (approvalId: string) => {
    approvalState.removeApproval(approvalId);
    taskCountState.refresh();
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[8],
        padding: themeCssVariables.spacing[4],
        width: '100%',
      }}
    >
      {approvalState.hasError ? (
        <Callout
          variant="error"
          title="Approvals could not be loaded"
          description="Please try again later."
        />
      ) : (
        <ApprovalInbox
          approvals={approvalState.approvals}
          onApprovalDecided={handleApprovalDecided}
        />
      )}
      {taskCountState.hasError || taskCountState.counts === undefined ? (
        <Callout
          variant="warning"
          title="The agent queue could not be loaded"
          description="Approvals still work. Reload the page to try again."
        />
      ) : (
        <TaskQueueOverview counts={taskCountState.counts} />
      )}
    </div>
  );
};
