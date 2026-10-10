type FilterCondition = {
  field: string;
  comparator: 'eq' | 'neq' | 'in' | 'gt' | 'gte' | 'lt' | 'lte' | 'ilike';
  value: string | string[];
};

const FIELD_PATTERN = /^[A-Za-z][A-Za-z0-9_.]*$/;

const quote = (value: string): string => {
  if (value.includes('"')) {
    throw new Error('A filter value must not contain a quote.');
  }

  return `"${value}"`;
};

// Values are always quoted, so user input can never add conditions.
export const buildFilter = (conditions: FilterCondition[]): string | undefined => {
  if (conditions.length === 0) {
    return undefined;
  }

  const parts = conditions.map(({ field, comparator, value }) => {
    if (!FIELD_PATTERN.test(field)) {
      throw new Error(`Invalid filter field: ${field}`);
    }

    const formatted = Array.isArray(value)
      ? `[${value.map(quote).join(',')}]`
      : quote(value);

    return `${field}[${comparator}]:${formatted}`;
  });

  return `and(${parts.join(',')})`;
};
