import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsSectionProps = {
  title: string;
  description?: string;
  adornment?: ReactNode;
  children?: ReactNode;
};

// Section.Header puts each description in a tooltip. The tooltip reads
// event.nativeEvent, which the front-component worker does not provide.
export const SettingsSection = ({
  title,
  description,
  adornment,
  children,
}: SettingsSectionProps) => (
  <section
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: themeCssVariables.spacing[4],
      width: '100%',
    }}
  >
    <div>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: themeCssVariables.spacing[2],
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            color: themeCssVariables.font.color.primary,
            fontSize: themeCssVariables.font.size.lg,
            fontWeight: themeCssVariables.font.weight.medium,
            lineHeight: themeCssVariables.text.lineHeight.md,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {adornment}
      </div>
      {description !== undefined && (
        <p
          style={{
            color: themeCssVariables.font.color.secondary,
            fontSize: themeCssVariables.font.size.md,
            lineHeight: themeCssVariables.text.lineHeight.lg,
            margin: 0,
            marginTop: themeCssVariables.spacing[2],
          }}
        >
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);
