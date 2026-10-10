import { extractNumbers } from 'src/utils/extract-numbers.util';

const PERCENT_FACTOR = 100;
const DECIMALS = 100;

const round = (value: number): number => Math.round(value * DECIMALS) / DECIMALS;

// Every number the facts contain, in text or as a value. A share such as 0.69
// also counts as 69, because the text may say "69 %".
export const collectFactNumbers = (facts: unknown): Set<number> => {
  const numbers = new Set<number>();

  const add = (value: number): void => {
    numbers.add(round(value));

    if (value > 0 && value < 1) {
      numbers.add(round(value * PERCENT_FACTOR));
    }
  };

  const visit = (node: unknown): void => {
    if (typeof node === 'number' && Number.isFinite(node)) {
      add(node);
    } else if (typeof node === 'string') {
      extractNumbers(node).forEach(({ value }) => add(value));
    } else if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (typeof node === 'object' && node !== null) {
      Object.values(node).forEach(visit);
    }
  };

  visit(facts);

  return numbers;
};

// The numbers of a text that no fact backs up, as written in the text.
export const findUnverifiedNumbers = (text: string, factNumbers: Set<number>): string[] =>
  [
    ...new Set(
      extractNumbers(text)
        .filter(({ value }) => !factNumbers.has(round(value)))
        .map(({ token }) => token),
    ),
  ];
