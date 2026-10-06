const collectTypes = (node: unknown, types: Set<string>): void => {
  if (Array.isArray(node)) {
    node.forEach((child) => collectTypes(child, types));

    return;
  }

  if (typeof node !== 'object' || node === null) {
    return;
  }

  const record = node as Record<string, unknown>;
  const declaredType = record['@type'];

  if (typeof declaredType === 'string') {
    types.add(declaredType);
  } else if (Array.isArray(declaredType)) {
    declaredType
      .filter((entry): entry is string => typeof entry === 'string')
      .forEach((entry) => types.add(entry));
  }

  Object.values(record).forEach((child) => {
    if (typeof child === 'object' && child !== null) {
      collectTypes(child, types);
    }
  });
};

export const collectStructuredDataTypes = (jsonLdBlocks: string[]): string[] => {
  const types = new Set<string>();

  for (const block of jsonLdBlocks) {
    try {
      collectTypes(JSON.parse(block), types);
    } catch {
      continue;
    }
  }

  return [...types];
};
