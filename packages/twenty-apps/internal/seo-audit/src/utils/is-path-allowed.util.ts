type PathRules = {
  allowRules: string[];
  disallowRules: string[];
};

const toPattern = (rule: string): RegExp => {
  const isAnchoredAtEnd = rule.endsWith('$');
  const escaped = (isAnchoredAtEnd ? rule.slice(0, -1) : rule)
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  return new RegExp(`^${escaped}${isAnchoredAtEnd ? '$' : ''}`);
};

const getLongestMatchLength = (path: string, rules: string[]): number =>
  rules.reduce(
    (longest, rule) =>
      toPattern(rule).test(path) ? Math.max(longest, rule.length) : longest,
    -1,
  );

export const isPathAllowed = (
  path: string,
  { allowRules, disallowRules }: PathRules,
): boolean => {
  const disallowLength = getLongestMatchLength(path, disallowRules);

  if (disallowLength === -1) {
    return true;
  }

  return getLongestMatchLength(path, allowRules) >= disallowLength;
};
