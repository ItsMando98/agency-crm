import { type SetupStep } from 'src/front-components/types/setup-step';

type BuildSetupStepsParams = {
  isApiKeyConfigured: boolean;
  isDataForSeoConfigured: boolean;
  hasFinishedAudit: boolean;
};

export const buildSetupSteps = ({
  isApiKeyConfigured,
  isDataForSeoConfigured,
  hasFinishedAudit,
}: BuildSetupStepsParams): SetupStep[] => [
  { id: 'ANTHROPIC_KEY', status: isApiKeyConfigured ? 'DONE' : 'TODO' },
  { id: 'DATAFORSEO', status: isDataForSeoConfigured ? 'DONE' : 'OPTIONAL' },
  { id: 'DEFAULTS', status: 'OPTIONAL' },
  { id: 'FIRST_AUDIT', status: hasFinishedAudit ? 'DONE' : 'TODO' },
];
