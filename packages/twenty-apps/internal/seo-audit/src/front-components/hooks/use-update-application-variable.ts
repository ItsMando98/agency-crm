import { MetadataApiClient } from 'twenty-client-sdk/metadata';

type UpdateApplicationVariableParams = {
  variableKey: string;
  value: string;
};

export const useUpdateApplicationVariable = (applicationId: string) => {
  const updateApplicationVariable = async ({
    variableKey,
    value,
  }: UpdateApplicationVariableParams): Promise<boolean> => {
    try {
      const client = new MetadataApiClient();

      await client.mutation({
        updateOneApplicationVariable: {
          __args: { key: variableKey, value, applicationId },
        },
      });

      return true;
    } catch {
      return false;
    }
  };

  return { updateApplicationVariable };
};
