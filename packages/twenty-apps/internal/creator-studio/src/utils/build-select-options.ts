type SelectOptionColor =
  | 'green'
  | 'turquoise'
  | 'sky'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'gray';

type SelectOptionInput = {
  id: string;
  value: string;
  label: string;
  color: SelectOptionColor;
};

export const buildSelectOptions = (inputs: SelectOptionInput[]) =>
  inputs.map((input, position) => ({ ...input, position }));
