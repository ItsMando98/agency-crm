import { Children, isValidElement, type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type FieldGroupProps = {
  children: ReactNode;
};

export const FieldGroup = ({ children }: FieldGroupProps) => {
  const fields = Children.toArray(children).filter(isValidElement);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {fields.map((field, index) => (
        <div
          key={field.key ?? index}
          style={{
            borderTop:
              index === 0
                ? 'none'
                : `1px solid ${themeCssVariables.border.color.light}`,
            paddingTop: index === 0 ? 0 : themeCssVariables.spacing[4],
            marginTop: index === 0 ? 0 : themeCssVariables.spacing[4],
          }}
        >
          {field}
        </div>
      ))}
    </div>
  );
};
