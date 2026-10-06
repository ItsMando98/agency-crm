import { defineView, ViewType } from 'twenty-sdk/define';

import { SEO_AUDIT_ON_SEO_AUDIT_TASK_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/seo-audit-on-seo-audit-task.field';
import {
  SEO_AUDIT_TASK_AREA_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_TASK_EFFORT_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_TASK_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_TASK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_TASK_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER,
} from 'src/objects/seo-audit-task.object';

export default defineView({
  universalIdentifier: '09dd16df-7a76-44f8-a778-345223529ff8',
  name: 'All SEO tasks',
  objectUniversalIdentifier: SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCheckbox',
  position: 0,
  fields: [
    { universalIdentifier: '905985d7-bcf7-4590-91a3-c1bea5f8d283', fieldMetadataUniversalIdentifier: SEO_AUDIT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 320 },
    { universalIdentifier: '45bcecc3-8334-4cff-98e4-2b09c6c1e4c2', fieldMetadataUniversalIdentifier: SEO_AUDIT_TASK_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 130 },
    { universalIdentifier: 'e0b4089d-0963-4e34-997b-69c1a4d41f9e', fieldMetadataUniversalIdentifier: SEO_AUDIT_TASK_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 110 },
    { universalIdentifier: '986bf945-0fec-429e-82ff-8ac14a8ada10', fieldMetadataUniversalIdentifier: SEO_AUDIT_TASK_EFFORT_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 100 },
    { universalIdentifier: 'ef5e66a1-8c87-463a-8fb0-02eed2ca4cb5', fieldMetadataUniversalIdentifier: SEO_AUDIT_TASK_AREA_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 160 },
    { universalIdentifier: '4c618739-0af5-426e-b8b1-ed3acb1bce21', fieldMetadataUniversalIdentifier: SEO_AUDIT_TASK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 110 },
    { universalIdentifier: '7136c8f4-0e22-403f-9f81-caa645425ffe', fieldMetadataUniversalIdentifier: SEO_AUDIT_ON_SEO_AUDIT_TASK_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 220 },
  ],
});
