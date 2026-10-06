import { defineView, ViewType } from 'twenty-sdk/define';

import { SEO_AUDIT_ON_SEO_AUDIT_PAGE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/seo-audit-on-seo-audit-page.field';
import {
  SEO_AUDIT_PAGE_HELPFULNESS_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_PAGE_NEEDS_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_PAGE_PAGE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_PAGE_STATUS_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_PAGE_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_PAGE_URL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/seo-audit-page.object';

export default defineView({
  universalIdentifier: 'd1cdb687-49dc-4000-a3ff-8be90aa1f029',
  name: 'All SEO audit pages',
  objectUniversalIdentifier: SEO_AUDIT_PAGE_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconFileSearch',
  position: 0,
  fields: [
    { universalIdentifier: 'f129bc73-9a6d-4ed4-aa8b-893b0a1bf15c', fieldMetadataUniversalIdentifier: SEO_AUDIT_PAGE_URL_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 360 },
    { universalIdentifier: '62bcc3bc-f3d6-4953-baed-a65684972098', fieldMetadataUniversalIdentifier: SEO_AUDIT_PAGE_STATUS_CODE_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 110 },
    { universalIdentifier: '582b91d9-02d1-42ad-a4f5-c54238f95f0b', fieldMetadataUniversalIdentifier: SEO_AUDIT_PAGE_PAGE_TYPE_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 140 },
    { universalIdentifier: 'd90f9de4-eec2-4a92-acec-a8415b4f434f', fieldMetadataUniversalIdentifier: SEO_AUDIT_PAGE_HELPFULNESS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 130 },
    { universalIdentifier: '68efea81-fa11-40da-8b19-7ff8d3db40c8', fieldMetadataUniversalIdentifier: SEO_AUDIT_PAGE_NEEDS_REVIEW_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 130 },
    { universalIdentifier: 'e2031200-d41e-4c57-a077-49dd38081b9a', fieldMetadataUniversalIdentifier: SEO_AUDIT_ON_SEO_AUDIT_PAGE_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 220 },
  ],
});
