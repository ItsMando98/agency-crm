import {
  DATAFORSEO_LOGIN_VARIABLE_KEY,
  DATAFORSEO_PASSWORD_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';

export const readDataForSeoCredentials = (
  environment: Record<string, string | undefined> = process.env,
): DataForSeoCredentials | null => {
  const login = environment[DATAFORSEO_LOGIN_VARIABLE_KEY]?.trim();
  const password = environment[DATAFORSEO_PASSWORD_VARIABLE_KEY]?.trim();

  return login === undefined || login === '' || password === undefined || password === ''
    ? null
    : { login, password };
};
