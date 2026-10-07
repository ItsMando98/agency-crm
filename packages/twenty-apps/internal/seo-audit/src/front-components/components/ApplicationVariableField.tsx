import { useId, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ChoiceButtons } from 'src/front-components/components/ChoiceButtons';
import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';
import { type SeoAuditApplicationVariable } from 'src/front-components/types/seo-audit-application-variable';
import { getVariableInputId } from 'src/front-components/utils/get-variable-input-id.util';
import { parseMaxPagesInput } from 'src/front-components/utils/parse-max-pages-input.util';
import { MAX_PAGES_VARIABLE_KEY } from 'src/constants/application-variable-keys.const';

type ApplicationVariableFieldProps = {
  variable: SeoAuditApplicationVariable;
  applicationId: string;
  storedValue: string;
  onSaved: (params: { variableKey: string; value: string }) => void;
};

export const ApplicationVariableField = ({
  variable,
  applicationId,
  storedValue,
  onSaved,
}: ApplicationVariableFieldProps) => {
  const inputId = getVariableInputId(variable.key);
  const descriptionId = useId();
  const [draftValue, setDraftValue] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const { updateApplicationVariable } = useUpdateApplicationVariable(applicationId);

  const isSecretStored = variable.isSecret && storedValue !== '';
  const currentValue = draftValue ?? (variable.isSecret ? '' : storedValue);
  const hasChanges = draftValue !== undefined && draftValue !== storedValue;

  const save = async (rawValue: string) => {
    const value =
      variable.key === MAX_PAGES_VARIABLE_KEY
        ? parseMaxPagesInput(rawValue)
        : rawValue.trim();

    if (value === null || (variable.isSecret && value === '')) {
      enqueueSnackbar({
        message: `Please enter a valid value for ${variable.label}.`,
        variant: 'error',
      });

      return;
    }

    setIsSaving(true);

    const isUpdated = await updateApplicationVariable({
      variableKey: variable.key,
      value,
    });

    setIsSaving(false);

    if (!isUpdated) {
      enqueueSnackbar({ message: `Could not save ${variable.label}.`, variant: 'error' });

      return;
    }

    setDraftValue(undefined);
    onSaved({ variableKey: variable.key, value });
    enqueueSnackbar({ message: `${variable.label} saved.`, variant: 'success' });
  };

  const labelStyle = {
    color: themeCssVariables.font.color.primary,
    fontSize: themeCssVariables.font.size.md,
    fontWeight: themeCssVariables.font.weight.medium,
  };
  const descriptionStyle = {
    color: themeCssVariables.font.color.tertiary,
    fontSize: themeCssVariables.font.size.sm,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[1] }}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: themeCssVariables.spacing[2],
          justifyContent: 'space-between',
        }}
      >
        <label htmlFor={inputId} style={labelStyle}>
          {variable.label}
        </label>
        {isSecretStored && <Status color="green">Saved</Status>}
      </div>
      <span id={descriptionId} style={descriptionStyle}>
        {variable.description}
      </span>
      {variable.type === 'SELECT' && variable.options !== null ? (
        <ChoiceButtons
          ariaLabel={variable.label}
          options={variable.options}
          value={storedValue}
          onValueChange={(nextValue) => save(nextValue)}
        />
      ) : (
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: themeCssVariables.spacing[2],
          }}
        >
          <Input
            id={inputId}
            aria-describedby={descriptionId}
            style={{ flex: '1 1 auto', minWidth: 0 }}
            type={variable.isSecret ? 'password' : variable.type === 'NUMBER' ? 'number' : 'text'}
            autoComplete="off"
            placeholder={isSecretStored ? 'Key saved. Enter a new key to replace it.' : 'Value'}
            value={currentValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && hasChanges) {
                save(currentValue);
              }
            }}
          />
          <Button
            variant="solid"
            color="accent"
            loading={isSaving}
            disabled={!hasChanges}
            onClick={() => save(currentValue)}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};
