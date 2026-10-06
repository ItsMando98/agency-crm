import { Status } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { type SetupStep } from 'src/front-components/types/setup-step';

const STEP_TEXT: Record<SetupStep['id'], { title: string; description: string }> = {
  ANTHROPIC_KEY: {
    title: 'Connect Anthropic',
    description: 'Add your API key so pages can be judged for helpfulness, specificity and trust.',
  },
  DEFAULTS: {
    title: 'Choose defaults',
    description: 'Pick the report language and how many pages each audit checks.',
  },
  FIRST_AUDIT: {
    title: 'Run your first audit',
    description: 'Enter a website below. The result appears on the audit record.',
  },
};

const STATUS_PRESENTATION: Record<
  SetupStep['status'],
  { color: 'green' | 'orange' | 'gray'; label: string }
> = {
  DONE: { color: 'green', label: 'Done' },
  TODO: { color: 'orange', label: 'To do' },
  OPTIONAL: { color: 'gray', label: 'Optional' },
};

type SetupStepRowProps = {
  step: SetupStep;
};

export const SetupStepRow = ({ step }: SetupStepRowProps) => {
  const text = STEP_TEXT[step.id];
  const presentation = STATUS_PRESENTATION[step.status];

  return (
    <li
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: themeCssVariables.spacing[2],
        justifyContent: 'space-between',
        listStyle: 'none',
        padding: `${themeCssVariables.spacing[2]} 0`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            color: themeCssVariables.font.color.primary,
            fontSize: themeCssVariables.font.size.md,
            fontWeight: themeCssVariables.font.weight.medium,
          }}
        >
          {text.title}
        </span>
        <span
          style={{
            color: themeCssVariables.font.color.tertiary,
            fontSize: themeCssVariables.font.size.sm,
          }}
        >
          {text.description}
        </span>
      </div>
      <Status color={presentation.color}>{presentation.label}</Status>
    </li>
  );
};
