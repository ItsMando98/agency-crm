import { defineView, ViewType } from 'twenty-sdk/define';

import { SEO_AUDIT_ON_SEO_KEYWORD_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/seo-audit-on-seo-keyword-opportunity.field';
import {
  SEO_KEYWORD_OPPORTUNITY_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_KEYWORD_OPPORTUNITY_KEYWORD_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_KEYWORD_OPPORTUNITY_POSITION_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_KEYWORD_OPPORTUNITY_RELEVANCE_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_KEYWORD_OPPORTUNITY_SEARCH_VOLUME_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER,
  SEO_KEYWORD_OPPORTUNITY_URL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/seo-keyword-opportunity.object';

export default defineView({
  universalIdentifier: 'ed4b2741-7cd0-4de3-84a3-31288726e5f1',
  name: 'All SEO keywords',
  objectUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconSearch',
  position: 0,
  fields: [
    { universalIdentifier: 'b396b10e-bb15-4de4-b474-cc663c4c6e14', fieldMetadataUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_KEYWORD_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 260 },
    { universalIdentifier: '131fb202-f65f-430c-a510-7a340ead2c80', fieldMetadataUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_POSITION_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 100 },
    { universalIdentifier: '5f89dc61-9d7a-4aa3-ba26-f9126910f7a5', fieldMetadataUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_SEARCH_VOLUME_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 150 },
    { universalIdentifier: '987a181a-6aee-47ab-b9ca-c2d390472af2', fieldMetadataUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 190 },
    { universalIdentifier: 'f0401794-dcfc-42c3-8648-c1ef06fbe4cd', fieldMetadataUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_RELEVANCE_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 130 },
    { universalIdentifier: '295d94d0-1bbd-41c6-b787-17f0888655f4', fieldMetadataUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_URL_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 280 },
    { universalIdentifier: 'e2a53aa2-6dd5-4ae1-b8cc-4569bf025867', fieldMetadataUniversalIdentifier: SEO_AUDIT_ON_SEO_KEYWORD_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 220 },
  ],
});
