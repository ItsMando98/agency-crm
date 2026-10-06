import { type SetupStep } from 'src/front-components/types/setup-step';

type BuildSetupStepsParams = {
  isApiKeyConfigured: boolean;
  isDataForSeoConfigured: boolean;
  isPdfRendererConfigured: boolean;
  hasFinishedAudit: boolean;
};

export const buildSetupSteps = ({
  isApiKeyConfigured,
  isDataForSeoConfigured,
  isPdfRendererConfigured,
  hasFinishedAudit,
}: BuildSetupStepsParams): SetupStep[] => [
  { id: 'ANTHROPIC_KEY', status: isApiKeyConfigured ? 'DONE' : 'TODO' },
  { id: 'DATAFORSEO', status: isDataForSeoConfigured ? 'DONE' : 'OPTIONAL' },
  { id: 'DEFAULTS', status: 'OPTIONAL' },
  { id: 'PDF_EXPORT', status: isPdfRendererConfigured ? 'DONE' : 'OPTIONAL' },
  { id: 'FIRST_AUDIT', status: hasFinishedAudit ? 'DONE' : 'TODO' },
];
