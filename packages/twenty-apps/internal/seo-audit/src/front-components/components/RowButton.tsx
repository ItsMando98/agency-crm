import { type ReactNode, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type RowButtonProps = {
  onClick: () => void;
  children: ReactNode;
};

// Front components render in a worker, so there is no :hover. Mouse and focus
// events are forwarded instead and drive the highlight through state.
export const RowButton = ({ onClick, children }: RowButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
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
        gap: themeCssVariables.spacing[3],
        justifyContent: 'space-between',
        minHeight: '44px',
        outline: isFocused
          ? `1px solid ${themeCssVariables.border.color.blue}`
          : 'none',
        padding: `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}`,
        textAlign: 'left',
        transform: isPressed ? 'scale(0.99)' : 'none',
        width: '100%',
      }}
    >
      {children}
    </button>
  );
};
