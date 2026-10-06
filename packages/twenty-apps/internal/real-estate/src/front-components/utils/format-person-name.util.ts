import { type PersonName } from 'src/front-components/types/showing-summary';

export const formatPersonName = (
  name: PersonName | null | undefined,
  fallback: string,
): string => {
  const fullName = [name?.firstName, name?.lastName]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part !== '')
    .join(' ');

  return fullName === '' ? fallback : fullName;
};
