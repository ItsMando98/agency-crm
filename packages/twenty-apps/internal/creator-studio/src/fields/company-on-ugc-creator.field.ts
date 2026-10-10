import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { UGC_CREATOR_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-creator.object';

export const COMPANY_ON_UGC_CREATOR_FIELD_UNIVERSAL_IDENTIFIER = 'd6603419-9df8-4442-becb-057bedd6b9d5';
export const UGC_CREATORS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER = '1fe353ee-d289-449e-afda-69cdff059b64';

export default defineField({
  universalIdentifier: COMPANY_ON_UGC_CREATOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: UGC_CREATOR_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'company',
  label: 'Company',
  icon: 'IconBuildingSkyscraper',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    UGC_CREATORS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'companyId',
  },
});
