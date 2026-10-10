import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsPanel } from 'src/front-components/components/SettingsPanel';
import { SettingsSection } from 'src/front-components/components/SettingsSection';
import { SetupStepRow } from 'src/front-components/components/SetupStepRow';
import { type SetupStep } from 'src/front-components/types/setup-step';
import { getSetupProgress } from 'src/front-components/utils/get-setup-progress.util';

type SetupChecklistProps = {
  steps: SetupStep[];
  onStepSelect: (stepId: SetupStep['id']) => void;
};

export const SetupChecklist = ({ steps, onStepSelect }: SetupChecklistProps) => {
  const { completed, total, percentage } = getSetupProgress(steps);

  if (completed === total) {
    return (
      <SettingsPanel>
        <SettingsSection
          title="SEO Audit is ready"
          description="Run audits from here, from a company or through your agents."
        />
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel>
      <SettingsSection
        title="Set up SEO Audit"
        description={`${completed} of ${total} required steps done`}
        adornment={
            <span
              style={{
                color: themeCssVariables.font.color.secondary,
                fontSize: themeCssVariables.font.size.sm,
                fontVariantNumeric: 'tabular-nums',
                fontWeight: themeCssVariables.font.weight.medium,
              }}
            >
              {percentage}%
          </span>
        }
      >
        <div
          role="progressbar"
          aria-label="Setup progress"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            background: themeCssVariables.background.transparent.medium,
            borderRadius: themeCssVariables.border.radius.pill,
            height: 3,
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <div
            style={{
              background: themeCssVariables.accent.primary,
              height: '100%',
              width: `${percentage}%`,
            }}
          />
        </div>
        <ul style={{ margin: 0, marginTop: themeCssVariables.spacing[2], padding: 0 }}>
          {steps.map((step) => (
            <SetupStepRow key={step.id} step={step} onSelect={onStepSelect} />
          ))}
        </ul>
      </SettingsSection>
    </SettingsPanel>
  );
};
