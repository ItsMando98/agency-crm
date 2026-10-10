import 'twenty-ui/style.css';

import { useState } from 'react';
import { Callout } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  AI_VISIBILITY_VARIABLE_KEY,
  ANTHROPIC_API_KEY_VARIABLE_KEY,
  DATAFORSEO_LOGIN_VARIABLE_KEY,
  DATAFORSEO_PASSWORD_VARIABLE_KEY,
  DEFAULT_LANGUAGE_VARIABLE_KEY,
  MARKET_VARIABLE_KEY,
  MAX_PAGES_VARIABLE_KEY,
  PDF_RENDERER_URL_VARIABLE_KEY,
  REPORT_ACCENT_COLOR_VARIABLE_KEY,
  REPORT_BRAND_NAME_VARIABLE_KEY,
  REPORT_PUBLIC_URL_VARIABLE_KEY,
  TREG_TOKEN_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { SEO_AUDIT_LANGUAGE } from 'src/constants/seo-audit.constants';
import { ApplicationVariableField } from 'src/front-components/components/ApplicationVariableField';
import { ConnectionsSection } from 'src/front-components/components/ConnectionsSection';
import { FieldGroup } from 'src/front-components/components/FieldGroup';
import { PageSectionHeading } from 'src/front-components/components/PageSectionHeading';
import { RecentAuditsSection } from 'src/front-components/components/RecentAuditsSection';
import { SettingsPanel } from 'src/front-components/components/SettingsPanel';
import { SetupChecklist } from 'src/front-components/components/SetupChecklist';
import { StartAuditSection } from 'src/front-components/components/StartAuditSection';
import { SETUP_STEP_FOCUS_TARGET_ID } from 'src/front-components/constants/focus-target-ids.const';
import { useRecentSeoAudits } from 'src/front-components/hooks/use-recent-seo-audits';
import { type SetupStep } from 'src/front-components/types/setup-step';
import { useSeoAuditApplicationVariables } from 'src/front-components/hooks/use-seo-audit-application-variables';
import { describeAiVisibilityProvider } from 'src/front-components/utils/describe-ai-visibility-provider.util';
import { buildSetupSteps } from 'src/front-components/utils/build-setup-steps.util';
import { getIsApplicationVariableConfigured } from 'src/front-components/utils/get-is-application-variable-configured.util';
import { type AuditLanguage } from 'src/types/audit-language';

export const SeoAuditSettings = () => {
  const { applicationId, applicationVariables, isLoading, hasError, errorMessage } =
    useSeoAuditApplicationVariables();
  const {
    recentAudits,
    hasFinishedAudit,
    isLoading: isLoadingAudits,
    refresh,
  } = useRecentSeoAudits();
  const [savedValueByKey, setSavedValueByKey] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading settings"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: themeCssVariables.spacing[4],
          width: '100%',
        }}
      >
        {[168, 148, 96].map((height) => (
          <div
            key={height}
            style={{
              background: themeCssVariables.background.transparent.lighter,
              border: `1px solid ${themeCssVariables.border.color.medium}`,
              borderRadius: themeCssVariables.border.radius.md,
              height,
            }}
          />
        ))}
      </div>
    );
  }

  if (hasError || applicationId === undefined) {
    return (
      <Callout
        variant="error"
        title="Settings could not be loaded"
        description={errorMessage ?? 'Please try again later.'}
      />
    );
  }

  const storedValueByKey = Object.fromEntries(
    applicationVariables.map((variable) => [variable.key, variable.value]),
  );
  const getValue = (key: string): string => savedValueByKey[key] ?? storedValueByKey[key] ?? '';
  const findVariable = (key: string) =>
    applicationVariables.find((variable) => variable.key === key);
  const isApiKeyConfigured = getIsApplicationVariableConfigured(
    getValue(ANTHROPIC_API_KEY_VARIABLE_KEY),
  );
  const isDataForSeoConfigured =
    getIsApplicationVariableConfigured(getValue(DATAFORSEO_LOGIN_VARIABLE_KEY)) &&
    getIsApplicationVariableConfigured(getValue(DATAFORSEO_PASSWORD_VARIABLE_KEY));
  const isTregConfigured = getIsApplicationVariableConfigured(getValue(TREG_TOKEN_VARIABLE_KEY));
  const isPdfRendererConfigured = getIsApplicationVariableConfigured(
    getValue(PDF_RENDERER_URL_VARIABLE_KEY),
  );
  const defaultLanguage: AuditLanguage =
    getValue(DEFAULT_LANGUAGE_VARIABLE_KEY) === SEO_AUDIT_LANGUAGE.EN
      ? SEO_AUDIT_LANGUAGE.EN
      : SEO_AUDIT_LANGUAGE.DE;

  // Focusing the target makes the host scroll it into view and puts the cursor there.
  const focusSetupStep = (stepId: SetupStep['id']) => {
    document.getElementById(SETUP_STEP_FOCUS_TARGET_ID[stepId])?.focus();
  };

  const renderField = (key: string) => {
    const variable = findVariable(key);

    return variable === undefined ? null : (
      <ApplicationVariableField
        key={key}
        variable={variable}
        applicationId={applicationId}
        storedValue={getValue(key)}
        onSaved={({ variableKey, value }) =>
          setSavedValueByKey((previous) => ({ ...previous, [variableKey]: value }))
        }
      />
    );
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[6],
        width: '100%',
      }}
    >
      <SetupChecklist
        steps={buildSetupSteps({
          isApiKeyConfigured,
          isDataForSeoConfigured,
          isPdfRendererConfigured,
          hasFinishedAudit,
        })}
        onStepSelect={focusSetupStep}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[3] }}>
        <StartAuditSection
          isApiKeyConfigured={isApiKeyConfigured}
          defaultLanguage={defaultLanguage}
          onAuditStarted={refresh}
        />
        <RecentAuditsSection audits={recentAudits} isLoading={isLoadingAudits} />
      </div>
      <ConnectionsSection
        renderField={renderField}
        getValue={getValue}
        isApiKeyConfigured={isApiKeyConfigured}
        isDataForSeoConfigured={isDataForSeoConfigured}
        isTregConfigured={isTregConfigured}
        isPdfRendererConfigured={isPdfRendererConfigured}
      />
      <section
        aria-label="Audit options"
        style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[3] }}
      >
        <PageSectionHeading
          title="Audit options"
          description="Applied when an audit is started without choices."
        />
        <SettingsPanel>
          <FieldGroup>
            {renderField(MARKET_VARIABLE_KEY)}
            {renderField(DEFAULT_LANGUAGE_VARIABLE_KEY)}
            {renderField(MAX_PAGES_VARIABLE_KEY)}
          </FieldGroup>
        </SettingsPanel>
        <SettingsPanel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[3] }}>
            {renderField(AI_VISIBILITY_VARIABLE_KEY)}
            <p
              style={{
                color: themeCssVariables.font.color.secondary,
                fontSize: themeCssVariables.font.size.sm,
                lineHeight: themeCssVariables.text.lineHeight.lg,
                margin: 0,
              }}
            >
              {describeAiVisibilityProvider({ isTregConfigured, isDataForSeoConfigured })}
            </p>
          </div>
        </SettingsPanel>
      </section>
      <section
        aria-label="Reports"
        style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[3] }}
      >
        <PageSectionHeading
          title="Reports"
          description="Every audit gets an HTML report page and an Excel file. Connect a PDF renderer above to attach a PDF as well."
        />
        <SettingsPanel>
          <FieldGroup>
            {renderField(REPORT_BRAND_NAME_VARIABLE_KEY)}
            {renderField(REPORT_ACCENT_COLOR_VARIABLE_KEY)}
            {renderField(REPORT_PUBLIC_URL_VARIABLE_KEY)}
          </FieldGroup>
        </SettingsPanel>
      </section>
    </div>
  );
};
