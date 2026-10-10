import { type ReactNode } from 'react';
import { IconApi, IconCpu, IconFileExport, IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  ANTHROPIC_API_KEY_VARIABLE_KEY,
  DATAFORSEO_LOGIN_VARIABLE_KEY,
  DATAFORSEO_PASSWORD_VARIABLE_KEY,
  PDF_RENDERER_API_KEY_VARIABLE_KEY,
  PDF_RENDERER_URL_VARIABLE_KEY,
  TREG_ORG_VARIABLE_KEY,
  TREG_TOKEN_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { ConnectionCard } from 'src/front-components/components/ConnectionCard';
import { FieldGroup } from 'src/front-components/components/FieldGroup';
import { PageSectionHeading } from 'src/front-components/components/PageSectionHeading';

type ConnectionsSectionProps = {
  renderField: (key: string) => ReactNode;
  getValue: (key: string) => string;
  isApiKeyConfigured: boolean;
  isDataForSeoConfigured: boolean;
  isTregConfigured: boolean;
  isPdfRendererConfigured: boolean;
};

const CARD_MIN_WIDTH_PX = 320;

export const ConnectionsSection = ({
  renderField,
  getValue,
  isApiKeyConfigured,
  isDataForSeoConfigured,
  isTregConfigured,
  isPdfRendererConfigured,
}: ConnectionsSectionProps) => {
  const signatureOf = (keys: string[]) => keys.map(getValue).join('\u0000');

  return (
    <section
      aria-label="Connections"
      style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[3] }}
    >
      <PageSectionHeading
        title="Connections"
        description="Keys stay in your workspace and are only used for audits. Test a connection after saving it."
      />
      <div
        style={{
          display: 'grid',
          gap: themeCssVariables.spacing[3],
          gridTemplateColumns: `repeat(auto-fit, minmax(${CARD_MIN_WIDTH_PX}px, 1fr))`,
        }}
      >
        <ConnectionCard
          service="ANTHROPIC"
          title="Anthropic"
          summary="Judges every page for helpfulness, specificity and trust and writes the customer questions for the AI check."
          icon={IconCpu}
          requirement="REQUIRED"
          isConfigured={isApiKeyConfigured}
          savedSignature={signatureOf([ANTHROPIC_API_KEY_VARIABLE_KEY])}
        >
          {renderField(ANTHROPIC_API_KEY_VARIABLE_KEY)}
        </ConnectionCard>
        <ConnectionCard
          service="DATAFORSEO"
          title="DataForSEO"
          summary="Adds rankings, keyword opportunities, backlinks, competitors and the mobile speed measurement. About 0.15 to 0.35 USD per audit."
          icon={IconSearch}
          requirement="OPTIONAL"
          isConfigured={isDataForSeoConfigured}
          savedSignature={signatureOf([DATAFORSEO_LOGIN_VARIABLE_KEY, DATAFORSEO_PASSWORD_VARIABLE_KEY])}
        >
          <FieldGroup>
            {renderField(DATAFORSEO_LOGIN_VARIABLE_KEY)}
            {renderField(DATAFORSEO_PASSWORD_VARIABLE_KEY)}
          </FieldGroup>
        </ConnectionCard>
        <ConnectionCard
          service="TREG"
          title="treg"
          summary="Answers the AI visibility questions through ChatGPT, Gemini and Perplexity for roughly 0.1 USD per audit. Used before DataForSEO."
          icon={IconApi}
          requirement="OPTIONAL"
          isConfigured={isTregConfigured}
          savedSignature={signatureOf([TREG_TOKEN_VARIABLE_KEY, TREG_ORG_VARIABLE_KEY])}
        >
          <FieldGroup>
            {renderField(TREG_TOKEN_VARIABLE_KEY)}
            {renderField(TREG_ORG_VARIABLE_KEY)}
          </FieldGroup>
        </ConnectionCard>
        <ConnectionCard
          service="PDF_RENDERER"
          title="PDF renderer"
          summary="Attaches a PDF to every audit. Excel and the report link work without it."
          icon={IconFileExport}
          requirement="OPTIONAL"
          isConfigured={isPdfRendererConfigured}
          savedSignature={signatureOf([PDF_RENDERER_URL_VARIABLE_KEY, PDF_RENDERER_API_KEY_VARIABLE_KEY])}
        >
          <FieldGroup>
            {renderField(PDF_RENDERER_URL_VARIABLE_KEY)}
            {renderField(PDF_RENDERER_API_KEY_VARIABLE_KEY)}
          </FieldGroup>
        </ConnectionCard>
      </div>
    </section>
  );
};
