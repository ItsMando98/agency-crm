import { type SetupStep } from 'src/front-components/types/setup-step';

export const getSetupProgress = (steps: SetupStep[]) => {
  const requiredSteps = steps.filter((step) => step.status !== 'OPTIONAL');
  const completed = requiredSteps.filter((step) => step.status === 'DONE').length;

  return {
    completed,
    total: requiredSteps.length,
    percentage:
      requiredSteps.length === 0
        ? 100
        : Math.round((completed / requiredSteps.length) * 100),
  };
};
