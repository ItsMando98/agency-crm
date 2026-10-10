type DescribeAiVisibilityProviderParams = {
  isTregConfigured: boolean;
  isDataForSeoConfigured: boolean;
};

export const describeAiVisibilityProvider = ({
  isTregConfigured,
  isDataForSeoConfigured,
}: DescribeAiVisibilityProviderParams): string => {
  if (isTregConfigured) {
    return 'Answers come from treg, roughly 0.1 USD per audit.';
  }

  if (isDataForSeoConfigured) {
    return 'Answers come from DataForSEO, roughly 0.5 to 1 USD per audit. A treg token makes it cheaper.';
  }

  return 'Add a treg token or a DataForSEO login to use this check.';
};
