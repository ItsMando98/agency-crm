import { useState } from 'react';
import { AppPath, enqueueSnackbar, navigate } from 'twenty-sdk/front-component';
import { Callout, Section } from 'twenty-ui/components';
import { Button, Input, SegmentedControl } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { SEO_AUDIT_LANGUAGE } from 'src/constants/seo-audit.constants';
import { START_AUDIT_DOMAIN_INPUT_ID } from 'src/front-components/constants/focus-target-ids.const';
import { useStartSeoAudit } from 'src/front-components/hooks/use-start-seo-audit';
import { type AuditLanguage } from 'src/types/audit-language';

type StartAuditSectionProps = {
  isApiKeyConfigured: boolean;
  defaultLanguage: AuditLanguage;
  onAuditStarted: () => void;
};

export const StartAuditSection = ({
  isApiKeyConfigured,
  defaultLanguage,
  onAuditStarted,
}: StartAuditSectionProps) => {
  const [domain, setDomain] = useState('');
  const [language, setLanguage] = useState<AuditLanguage | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const { startSeoAudit, isStarting } = useStartSeoAudit();

  const submit = async () => {
    setErrorMessage(undefined);

    const result = await startSeoAudit({
      domain,
      language: language ?? defaultLanguage,
    });

    if (result.errorMessage !== undefined) {
      setErrorMessage(result.errorMessage);

      return;
    }

    setDomain('');
    onAuditStarted();
    enqueueSnackbar({ message: 'Audit queued. It usually takes a few minutes.', variant: 'success' });
    await navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'seoAudit',
      objectRecordId: result.auditId,
    });
  };

  return (
    <Section.Root>
      <Section.Header
        title="Run an audit"
        description="Enter the homepage of any public website."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[2] }}>
        {!isApiKeyConfigured && (
          <Callout
            variant="warning"
            title="No Anthropic key yet"
            description="The audit still runs, but without the content quality judgement."
          />
        )}
        {errorMessage !== undefined && (
          <Callout variant="error" title="Audit not started" description={errorMessage} />
        )}
        <div style={{ display: 'flex', gap: themeCssVariables.spacing[2] }}>
          <Input
            id={START_AUDIT_DOMAIN_INPUT_ID}
            aria-label="Website"
            placeholder="example.com"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && domain.trim() !== '') {
                submit();
              }
            }}
          />
          <SegmentedControl
            aria-label="Report language"
            options={[
              { value: SEO_AUDIT_LANGUAGE.DE, label: 'DE' },
              { value: SEO_AUDIT_LANGUAGE.EN, label: 'EN' },
            ]}
            value={language ?? defaultLanguage}
            onValueChange={(value) => setLanguage(value as AuditLanguage)}
          />
          <Button
            variant="solid"
            color="accent"
            loading={isStarting}
            disabled={domain.trim() === ''}
            onClick={submit}
          >
            Start audit
          </Button>
        </div>
      </div>
    </Section.Root>
  );
};
