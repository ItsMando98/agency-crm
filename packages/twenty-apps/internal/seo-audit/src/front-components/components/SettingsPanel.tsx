import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsPanelProps = {
  children: ReactNode;
  emphasis?: boolean;
};

export const SettingsPanel = ({ children, emphasis = false }: SettingsPanelProps) => (
  <div
    style={{
      background: themeCssVariables.background.transparent.lighter,
      border: `1px solid ${
        emphasis
          ? themeCssVariables.border.color.strong
          : themeCssVariables.border.color.medium
      }`,
      borderRadius: themeCssVariables.border.radius.md,
      boxSizing: 'border-box',
      padding: themeCssVariables.spacing[4],
      width: '100%',
    }}
  >
    {children}
  </div>
);
