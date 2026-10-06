import {
  ANTHROPIC_API_KEY_VARIABLE_KEY,
  DATAFORSEO_LOGIN_VARIABLE_KEY,
  MAX_PAGES_VARIABLE_KEY,
  PDF_RENDERER_URL_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { type SetupStep } from 'src/front-components/types/setup-step';
import { getVariableInputId } from 'src/front-components/utils/get-variable-input-id.util';

export const START_AUDIT_DOMAIN_INPUT_ID = 'seo-audit-start-domain';

export const SETUP_STEP_FOCUS_TARGET_ID: Record<SetupStep['id'], string> = {
  ANTHROPIC_KEY: getVariableInputId(ANTHROPIC_API_KEY_VARIABLE_KEY),
  DATAFORSEO: getVariableInputId(DATAFORSEO_LOGIN_VARIABLE_KEY),
  DEFAULTS: getVariableInputId(MAX_PAGES_VARIABLE_KEY),
  PDF_EXPORT: getVariableInputId(PDF_RENDERER_URL_VARIABLE_KEY),
  FIRST_AUDIT: START_AUDIT_DOMAIN_INPUT_ID,
};
