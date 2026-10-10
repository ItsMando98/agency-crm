import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  COMPANY_ON_UGC_CREATOR_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_CREATORS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/company-on-ugc-creator.field';
import { UGC_CREATOR_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-creator.object';

export default defineField({
  universalIdentifier: UGC_CREATORS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'ugcCreators',
  label: 'UGC creators',
  icon: 'IconUserStar',
  relationTargetObjectMetadataUniversalIdentifier: UGC_CREATOR_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    COMPANY_ON_UGC_CREATOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
