import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  CREATOR_ON_UGC_ASSET_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_ASSETS_ON_CREATOR_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/creator-on-ugc-asset.field';
import { UGC_ASSET_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-asset.object';
import { UGC_CREATOR_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-creator.object';

export default defineField({
  universalIdentifier: UGC_ASSETS_ON_CREATOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: UGC_CREATOR_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'ugcAssets',
  label: 'Assets',
  icon: 'IconPhotoVideo',
  relationTargetObjectMetadataUniversalIdentifier: UGC_ASSET_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    CREATOR_ON_UGC_ASSET_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
