// Finds the numbers in a text, in German and English notation, as plain numbers.
// "54.000" and "54,000" are thousands, "0,67" and "0.67" are decimals.
const NUMBER_PATTERN = /\d+(?:[.,]\d+)*/g;
const THOUSANDS_GROUP_LENGTH = 3;

const toNumber = (token: string): number | null => {
  const separators = token.match(/[.,]/g) ?? [];

  if (separators.length === 0) {
    return Number(token);
  }

  const parts = token.split(/[.,]/);
  const looksLikeThousands =
    parts.length > 1 &&
    parts[0] !== undefined &&
    parts[0].length >= 1 &&
    parts[0].length <= THOUSANDS_GROUP_LENGTH &&
    parts[0] !== '0' &&
    parts.slice(1).every((part) => part.length === THOUSANDS_GROUP_LENGTH);

  if (looksLikeThousands) {
    return Number(parts.join(''));
  }

  const lastSeparator = Math.max(token.lastIndexOf('.'), token.lastIndexOf(','));
  const integerPart = token.slice(0, lastSeparator).replace(/[.,]/g, '');
  const value = Number(`${integerPart}.${token.slice(lastSeparator + 1)}`);

  return Number.isFinite(value) ? value : null;
};

export type ExtractedNumber = { token: string; value: number };

export const extractNumbers = (text: string): ExtractedNumber[] =>
  [...text.matchAll(NUMBER_PATTERN)].flatMap((match) => {
    const value = toNumber(match[0]);

    return value === null || !Number.isFinite(value) ? [] : [{ token: match[0], value }];
  });
