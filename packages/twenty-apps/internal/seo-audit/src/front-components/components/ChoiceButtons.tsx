import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type ChoiceButtonsOption = {
  label: string;
  value: string;
};

type ChoiceButtonsProps = {
  ariaLabel: string;
  options: readonly ChoiceButtonsOption[];
  value: string;
  onValueChange: (value: string) => void;
};

type ChoiceButtonProps = {
  isSelected: boolean;
  label: string;
  onSelect: () => void;
};

// SegmentedControl is a Base UI radio group. Its focus handler reads
// event.nativeEvent, which the front-component worker does not provide.
const ChoiceButton = ({ isSelected, label, onSelect }: ChoiceButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        background: isSelected
          ? themeCssVariables.background.secondary
          : isHovered
            ? themeCssVariables.background.transparent.light
            : 'transparent',
        border: `1px solid ${
          isSelected ? themeCssVariables.border.color.strong : 'transparent'
        }`,
        borderRadius: themeCssVariables.border.radius.xs,
        boxShadow: isSelected ? themeCssVariables.boxShadow.light : 'none',
        color: isSelected
          ? themeCssVariables.font.color.primary
          : themeCssVariables.font.color.tertiary,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: themeCssVariables.font.size.sm,
        fontWeight: isSelected
          ? themeCssVariables.font.weight.medium
          : themeCssVariables.font.weight.regular,
        padding: `${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}`,
        transform: isPressed ? 'scale(0.98)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
};

export const ChoiceButtons = ({
  ariaLabel,
  options,
  value,
  onValueChange,
}: ChoiceButtonsProps) => (
  <div
    role="group"
    aria-label={ariaLabel}
    style={{
      background: themeCssVariables.background.primary,
      border: `1px solid ${themeCssVariables.border.color.medium}`,
      borderRadius: themeCssVariables.border.radius.sm,
      boxSizing: 'border-box',
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: themeCssVariables.spacing['0.5'],
      padding: themeCssVariables.spacing['0.5'],
    }}
  >
    {options.map((option) => (
      <ChoiceButton
        key={option.value}
        isSelected={option.value === value}
        label={option.label}
        onSelect={() => onValueChange(option.value)}
      />
    ))}
  </div>
);
