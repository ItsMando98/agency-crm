import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier.const';
import { type SeoAuditApplicationVariable } from 'src/front-components/types/seo-audit-application-variable';
import { parseVariableOptions } from 'src/front-components/utils/parse-variable-options.util';

type SeoAuditApplicationVariablesState = {
  applicationId: string | undefined;
  applicationVariables: SeoAuditApplicationVariable[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
};

export const useSeoAuditApplicationVariables =
  (): SeoAuditApplicationVariablesState => {
    const [state, setState] = useState<SeoAuditApplicationVariablesState>({
      applicationId: undefined,
      applicationVariables: [],
      isLoading: true,
      hasError: false,
    });

    useEffect(() => {
      let isCancelled = false;

      const fetchApplicationVariables = async () => {
        try {
          const client = new MetadataApiClient();
          const result = await client.query({
            findOneApplication: {
              __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
              id: true,
              applicationVariables: {
                key: true,
                value: true,
                label: true,
                description: true,
                isSecret: true,
                isDeprecated: true,
                type: true,
                options: true,
              },
            },
          });
          const application = result.findOneApplication;

          if (isCancelled) {
            return;
          }

          setState({
            applicationId: application?.id,
            applicationVariables: (application?.applicationVariables ?? [])
              .filter((variable) => !variable.isDeprecated)
              .map((variable) => ({
                ...variable,
                options: parseVariableOptions(variable.options),
              })),
            isLoading: false,
            hasError: application?.id === undefined,
            errorMessage:
              application?.id === undefined
                ? 'The SEO Audit application was not found.'
                : undefined,
          });
        } catch (error) {
          if (!isCancelled) {
            setState({
              applicationId: undefined,
              applicationVariables: [],
              isLoading: false,
              hasError: true,
              errorMessage:
                error instanceof Error ? error.message : String(error),
            });
          }
        }
      };

      fetchApplicationVariables();

      return () => {
        isCancelled = true;
      };
    }, []);

    return state;
  };
