import { type ReactNode } from 'react';
import { IconAlertCircle, IconCheck, type IconComponent } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useTestConnection } from 'src/front-components/hooks/use-test-connection';
import { type ConnectionService, type ConnectionTestResult } from 'src/types/connection-test';

type ConnectionCardProps = {
  service: ConnectionService;
  title: string;
  summary: string;
  icon: IconComponent;
  requirement: 'REQUIRED' | 'OPTIONAL';
  isConfigured: boolean;
  // Changes when a saved value changes, which drops a test result that no longer applies.
  savedSignature: string;
  children: ReactNode;
};

type StatusPresentation = { color: 'green' | 'red' | 'orange' | 'gray'; label: string };

const getStatusPresentation = ({
  result,
  isConfigured,
  requirement,
}: {
  result: ConnectionTestResult | null;
  isConfigured: boolean;
  requirement: ConnectionCardProps['requirement'];
}): StatusPresentation => {
  if (result?.status === 'OK') {
    return { color: 'green', label: 'Works' };
  }

  if (result?.status === 'FAILED') {
    return { color: 'red', label: 'Failed' };
  }

  if (isConfigured) {
    return { color: 'gray', label: 'Saved, not tested' };
  }

  return requirement === 'REQUIRED'
    ? { color: 'orange', label: 'Required' }
    : { color: 'gray', label: 'Optional' };
};

const ConnectionCardBody = ({
  service,
  title,
  summary,
  icon: CardIcon,
  requirement,
  isConfigured,
  children,
}: Omit<ConnectionCardProps, 'savedSignature'>) => {
  const { result, isTesting, testConnection } = useTestConnection(service);
  const presentation = getStatusPresentation({ result, isConfigured, requirement });
  const isFailure = result?.status === 'FAILED';

  return (
    <section
      aria-label={title}
      style={{
        background: themeCssVariables.background.transparent.lighter,
        border: `1px solid ${
          isFailure ? themeCssVariables.border.color.danger : themeCssVariables.border.color.medium
        }`,
        borderRadius: themeCssVariables.border.radius.md,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[4],
        height: '100%',
        padding: themeCssVariables.spacing[4],
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[2] }}>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: themeCssVariables.spacing[3],
            justifyContent: 'space-between',
          }}
        >
          <span style={{ alignItems: 'center', display: 'flex', gap: themeCssVariables.spacing[2] }}>
            <span
              aria-hidden
              style={{
                alignItems: 'center',
                background: themeCssVariables.background.transparent.light,
                borderRadius: themeCssVariables.border.radius.sm,
                display: 'flex',
                height: 28,
                justifyContent: 'center',
                width: 28,
              }}
            >
              <CardIcon size={16} color={themeCssVariables.font.color.secondary} />
            </span>
            <h3
              style={{
                color: themeCssVariables.font.color.primary,
                fontSize: themeCssVariables.font.size.md,
                fontWeight: themeCssVariables.font.weight.semiBold,
                margin: 0,
              }}
            >
              {title}
            </h3>
          </span>
          <Status color={presentation.color}>{presentation.label}</Status>
        </div>
        <p
          style={{
            color: themeCssVariables.font.color.tertiary,
            fontSize: themeCssVariables.font.size.sm,
            lineHeight: themeCssVariables.text.lineHeight.lg,
            margin: 0,
          }}
        >
          {summary}
        </p>
      </header>
      <div style={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>{children}</div>
      <footer
        style={{
          alignItems: 'flex-start',
          borderTop: `1px solid ${themeCssVariables.border.color.light}`,
          display: 'flex',
          flexDirection: 'column',
          gap: themeCssVariables.spacing[2],
          paddingTop: themeCssVariables.spacing[3],
        }}
      >
        <Button
          size="sm"
          loading={isTesting}
          onClick={testConnection}
          aria-label={`Test ${title} connection`}
        >
          Test connection
        </Button>
        <p
          role="status"
          style={{
            alignItems: 'flex-start',
            color: isFailure
              ? themeCssVariables.color.red
              : result?.status === 'OK'
                ? themeCssVariables.color.green
                : themeCssVariables.font.color.tertiary,
            display: 'flex',
            fontSize: themeCssVariables.font.size.sm,
            gap: themeCssVariables.spacing[1],
            lineHeight: themeCssVariables.text.lineHeight.lg,
            margin: 0,
            minHeight: 18,
          }}
        >
          {result === null ? (
            'Tests the saved values against the provider.'
          ) : (
            <>
              <span aria-hidden style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}>
                {result.status === 'OK' ? <IconCheck size={14} /> : <IconAlertCircle size={14} />}
              </span>
              <span>{result.message}</span>
            </>
          )}
        </p>
      </footer>
    </section>
  );
};

export const ConnectionCard = ({ savedSignature, ...props }: ConnectionCardProps) => (
  <ConnectionCardBody key={savedSignature} {...props} />
);
