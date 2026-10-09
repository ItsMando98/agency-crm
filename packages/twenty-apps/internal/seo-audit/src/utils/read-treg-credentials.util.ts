import {
  TREG_ORG_VARIABLE_KEY,
  TREG_TOKEN_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { type TregCredentials } from 'src/types/treg-credentials';

export const readTregCredentials = (
  environment: Record<string, string | undefined> = process.env,
): TregCredentials | null => {
  const token = environment[TREG_TOKEN_VARIABLE_KEY]?.trim();
  const organization = environment[TREG_ORG_VARIABLE_KEY]?.trim();

  if (token === undefined || token === '') {
    return null;
  }

  return {
    token,
    organization:
      organization === undefined || organization === '' ? null : organization,
  };
};
