import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import { UGC_ASSET_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-asset.object';
import { UGC_CREATOR_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-creator.object';

export const CREATOR_ON_UGC_ASSET_FIELD_UNIVERSAL_IDENTIFIER = '95b02e9d-1605-4c86-a4b8-bd6c15d6b739';
export const UGC_ASSETS_ON_CREATOR_FIELD_UNIVERSAL_IDENTIFIER = '837dede4-eefe-4d94-a27d-92e033a4d9d7';

export default defineField({
  universalIdentifier: CREATOR_ON_UGC_ASSET_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: UGC_ASSET_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'creator',
  label: 'Creator',
  icon: 'IconUserStar',
  relationTargetObjectMetadataUniversalIdentifier: UGC_CREATOR_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    UGC_ASSETS_ON_CREATOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'creatorId',
  },
});
