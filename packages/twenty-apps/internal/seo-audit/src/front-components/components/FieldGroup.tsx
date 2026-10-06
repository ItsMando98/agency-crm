import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type FieldGroupProps = {
  children: ReactNode;
};

export const FieldGroup = ({ children }: FieldGroupProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: themeCssVariables.spacing[4],
    }}
  >
    {children}
  </div>
);
