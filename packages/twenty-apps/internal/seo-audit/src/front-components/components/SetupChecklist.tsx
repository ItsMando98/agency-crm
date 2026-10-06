import { Section } from 'twenty-ui/components';
import { ProgressBar } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

import { SetupStepRow } from 'src/front-components/components/SetupStepRow';
import { type SetupStep } from 'src/front-components/types/setup-step';
import { getSetupProgress } from 'src/front-components/utils/get-setup-progress.util';

type SetupChecklistProps = {
  steps: SetupStep[];
};

export const SetupChecklist = ({ steps }: SetupChecklistProps) => {
  const { completed, total, percentage } = getSetupProgress(steps);

  return (
    <Section.Root>
      <Section.Header
        title="Set up SEO Audit"
        description={
          completed === total
            ? 'Everything is ready. Run audits from here, from a company or through your agents.'
            : `${completed} of ${total} required steps done`
        }
      />
      <ProgressBar value={percentage} ariaLabel="Setup progress" />
      <ul style={{ margin: 0, marginTop: themeCssVariables.spacing[2], padding: 0 }}>
        {steps.map((step) => (
          <SetupStepRow key={step.id} step={step} />
        ))}
      </ul>
    </Section.Root>
  );
};
