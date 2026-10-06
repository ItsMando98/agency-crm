import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components';
import { Status } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { RowButton } from 'src/front-components/components/RowButton';
import {
  TASK_STATUS_DISPLAY_ORDER,
  TASK_STATUS_PRESENTATION,
} from 'src/front-components/constants/desk-presentation.const';
import { type AgentTaskCounts } from 'src/front-components/hooks/use-agent-task-counts';

type TaskQueueOverviewProps = {
  counts: AgentTaskCounts;
};

export const TaskQueueOverview = ({ counts }: TaskQueueOverviewProps) => (
  <Section.Root>
    <Section.Header
      title="Agent queue"
      description="Where the agents stand right now. Open a tile to see the tasks."
    />
    <div
      style={{
        display: 'grid',
        gap: themeCssVariables.spacing[2],
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      }}
    >
      {TASK_STATUS_DISPLAY_ORDER.map((status) => {
        const presentation = TASK_STATUS_PRESENTATION[status];

        return (
          <div
            key={status}
            style={{
              border: `1px solid ${themeCssVariables.border.color.medium}`,
              borderRadius: themeCssVariables.border.radius.md,
            }}
          >
            <RowButton
              ariaLabel={`${presentation.label}: ${counts[status]} tasks`}
              onClick={() =>
                navigate(AppPath.RecordIndexPage, { objectNamePlural: 'agentTasks' })
              }
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[1] }}>
                <Status color={presentation.color}>{presentation.label}</Status>
                <span
                  style={{
                    fontSize: themeCssVariables.font.size.xl,
                    fontWeight: themeCssVariables.font.weight.semiBold,
                  }}
                >
                  {counts[status]}
                </span>
              </span>
            </RowButton>
          </div>
        );
      })}
    </div>
  </Section.Root>
);
