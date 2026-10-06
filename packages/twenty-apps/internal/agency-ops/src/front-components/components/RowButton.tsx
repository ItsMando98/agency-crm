import { type ReactNode, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type RowButtonProps = {
  onClick: () => void;
  ariaLabel?: string;
  children: ReactNode;
};

// Front components render in a worker, so there is no :hover. Mouse and focus
// events are forwarded instead and drive the highlight through state.
export const RowButton = ({ onClick, ariaLabel, children }: RowButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        alignItems: 'center',
        background:
          isHovered || isFocused
            ? themeCssVariables.background.transparent.lighter
            : 'transparent',
        border: 'none',
        borderRadius: themeCssVariables.border.radius.sm,
        boxSizing: 'border-box',
        color: themeCssVariables.font.color.primary,
        cursor: 'pointer',
        display: 'flex',
        fontFamily: 'inherit',
        fontSize: themeCssVariables.font.size.md,
        gap: themeCssVariables.spacing[2],
        justifyContent: 'space-between',
        outline: isFocused
          ? `1px solid ${themeCssVariables.border.color.blue}`
          : 'none',
        padding: themeCssVariables.spacing[2],
        textAlign: 'left',
        transition: 'background 120ms ease',
        width: '100%',
      }}
    >
      {children}
    </button>
  );
};
