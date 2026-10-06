export const getIsApplicationVariableConfigured = (
  storedValue: string | undefined,
): boolean => storedValue !== undefined && storedValue.trim() !== '';
