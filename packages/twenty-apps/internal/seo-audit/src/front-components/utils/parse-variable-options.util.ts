type VariableOption = { label: string; value: string };

export const parseVariableOptions = (raw: unknown): VariableOption[] | null => {
  if (!Array.isArray(raw)) {
    return null;
  }

  const options = raw.filter(
    (entry): entry is VariableOption =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as VariableOption).label === 'string' &&
      typeof (entry as VariableOption).value === 'string',
  );

  return options.length > 0 ? options : null;
};
