import {
  IconFileExport,
  IconKey,
  IconPlayerPlay,
  IconSearch,
  IconSettings,
  type IconComponent,
} from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { RowButton } from 'src/front-components/components/RowButton';
import { type SetupStep } from 'src/front-components/types/setup-step';

const STEP_TEXT: Record<SetupStep['id'], { title: string; description: string }> = {
  ANTHROPIC_KEY: {
    title: 'Connect Anthropic',
    description: 'Add your API key so pages can be judged for helpfulness, specificity and trust.',
  },
  DATAFORSEO: {
    title: 'Connect DataForSEO',
    description:
      'Optional. Adds rankings, keyword opportunities, backlinks and competitors to every audit.',
  },
  DEFAULTS: {
    title: 'Choose defaults',
    description: 'Pick the market, report language and how many pages each audit checks.',
  },
  PDF_EXPORT: {
    title: 'Set up PDF export',
    description:
      'Optional. Connect a PDF renderer to attach a PDF to every audit. Excel and the report link work without it.',
  },
  FIRST_AUDIT: {
    title: 'Run your first audit',
    description: 'Enter a website below. The result appears on the audit record.',
  },
};

const STEP_ICON: Record<SetupStep['id'], IconComponent> = {
  ANTHROPIC_KEY: IconKey,
  DATAFORSEO: IconSearch,
  DEFAULTS: IconSettings,
  PDF_EXPORT: IconFileExport,
  FIRST_AUDIT: IconPlayerPlay,
};

const STATUS_PRESENTATION: Record<
  SetupStep['status'],
  { color: 'green' | 'orange' | 'gray'; label: string }
> = {
  DONE: { color: 'green', label: 'Done' },
  TODO: { color: 'orange', label: 'To do' },
  OPTIONAL: { color: 'gray', label: 'Optional' },
};

// Resolved during render. The manifest loader mocks twenty-ui, so reading
// theme tokens while the module loads crashes the install.
const getStepIconColor = (status: SetupStep['status']) => {
  if (status === 'DONE') {
    return themeCssVariables.color.green;
  }

  if (status === 'TODO') {
    return themeCssVariables.accent.primary;
  }

  return themeCssVariables.font.color.tertiary;
};

type SetupStepRowProps = {
  step: SetupStep;
  onSelect: (stepId: SetupStep['id']) => void;
};

export const SetupStepRow = ({ step, onSelect }: SetupStepRowProps) => {
  const text = STEP_TEXT[step.id];
  const presentation = STATUS_PRESENTATION[step.status];
  const StepIcon = STEP_ICON[step.id];

  return (
    <li style={{ listStyle: 'none' }}>
      <RowButton onClick={() => onSelect(step.id)}>
        <span
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: themeCssVariables.spacing[3],
            minWidth: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              alignItems: 'center',
              background: themeCssVariables.background.transparent.light,
              borderRadius: themeCssVariables.border.radius.sm,
              display: 'flex',
              flexShrink: 0,
              height: 28,
              justifyContent: 'center',
              width: 28,
            }}
          >
            <StepIcon size={16} color={getStepIconColor(step.status)} />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
                lineHeight: themeCssVariables.text.lineHeight.lg,
              }}
            >
              {text.description}
            </span>
          </span>
        </span>
        <span style={{ flexShrink: 0 }}>
          <Status color={presentation.color}>{presentation.label}</Status>
        </span>
      </RowButton>
    </li>
  );
};
