import 'twenty-ui/style.css';

import { useState } from 'react';
import { Callout, Section } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  ANTHROPIC_API_KEY_VARIABLE_KEY,
  DEFAULT_LANGUAGE_VARIABLE_KEY,
  MAX_PAGES_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { SEO_AUDIT_LANGUAGE } from 'src/constants/seo-audit.constants';
import { ApplicationVariableField } from 'src/front-components/components/ApplicationVariableField';
import { RecentAuditsSection } from 'src/front-components/components/RecentAuditsSection';
import { SetupChecklist } from 'src/front-components/components/SetupChecklist';
import { StartAuditSection } from 'src/front-components/components/StartAuditSection';
import { useRecentSeoAudits } from 'src/front-components/hooks/use-recent-seo-audits';
import { useSeoAuditApplicationVariables } from 'src/front-components/hooks/use-seo-audit-application-variables';
import { buildSetupSteps } from 'src/front-components/utils/build-setup-steps.util';
import { getIsApplicationVariableConfigured } from 'src/front-components/utils/get-is-application-variable-configured.util';
import { type AuditLanguage } from 'src/types/audit-language';

export const SeoAuditSettings = () => {
  const { applicationId, applicationVariables, isLoading, hasError } =
    useSeoAuditApplicationVariables();
  const { recentAudits, hasFinishedAudit, refresh } = useRecentSeoAudits();
  const [savedValueByKey, setSavedValueByKey] = useState<Record<string, string>>({});

  if (isLoading) {
    return <Callout variant="neutral" title="Loading settings" />;
  }

  if (hasError || applicationId === undefined) {
    return (
      <Callout
        variant="error"
        title="Settings could not be loaded"
        description="Please try again later."
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
  const defaultLanguage: AuditLanguage =
    getValue(DEFAULT_LANGUAGE_VARIABLE_KEY) === SEO_AUDIT_LANGUAGE.EN
      ? SEO_AUDIT_LANGUAGE.EN
      : SEO_AUDIT_LANGUAGE.DE;

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
        gap: themeCssVariables.spacing[8],
        width: '100%',
      }}
    >
      <SetupChecklist
        steps={buildSetupSteps({ isApiKeyConfigured, hasFinishedAudit })}
      />
      <Section.Root>
        <Section.Header
          title="Anthropic"
          description="The key stays in your workspace and is only used for audits."
        />
        {renderField(ANTHROPIC_API_KEY_VARIABLE_KEY)}
      </Section.Root>
      <Section.Root>
        <Section.Header title="Defaults" description="Applied when an audit is started without choices." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[4] }}>
          {renderField(DEFAULT_LANGUAGE_VARIABLE_KEY)}
          {renderField(MAX_PAGES_VARIABLE_KEY)}
        </div>
      </Section.Root>
      <StartAuditSection
        isApiKeyConfigured={isApiKeyConfigured}
        defaultLanguage={defaultLanguage}
        onAuditStarted={refresh}
      />
      <RecentAuditsSection audits={recentAudits} />
    </div>
  );
};
