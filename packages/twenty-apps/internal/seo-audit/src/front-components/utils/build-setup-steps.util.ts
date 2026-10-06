import { type SetupStep } from 'src/front-components/types/setup-step';

type BuildSetupStepsParams = {
  isApiKeyConfigured: boolean;
  hasFinishedAudit: boolean;
};

export const buildSetupSteps = ({
  isApiKeyConfigured,
  hasFinishedAudit,
}: BuildSetupStepsParams): SetupStep[] => [
  { id: 'ANTHROPIC_KEY', status: isApiKeyConfigured ? 'DONE' : 'TODO' },
  { id: 'DEFAULTS', status: 'OPTIONAL' },
  { id: 'FIRST_AUDIT', status: hasFinishedAudit ? 'DONE' : 'TODO' },
];
