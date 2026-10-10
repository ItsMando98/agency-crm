import { defineView, ViewType } from 'twenty-sdk/define';

import { CREATOR_ON_UGC_ASSET_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/creator-on-ugc-asset.field';
import {
  UGC_ASSET_COST_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_ASSET_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_ASSET_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_ASSET_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_ASSET_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_ASSET_UNIVERSAL_IDENTIFIER,
} from 'src/objects/ugc-asset.object';

export default defineView({
  universalIdentifier: '4a446160-fb14-465a-91e0-662b9b9a4605',
  name: 'All UGC assets',
  objectUniversalIdentifier: UGC_ASSET_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconPhotoVideo',
  position: 0,
  fields: [
    { universalIdentifier: 'bd8afea8-8824-4bf3-8cc1-6fdff602a314', fieldMetadataUniversalIdentifier: UGC_ASSET_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '07dc9818-f23d-4a7d-add3-5476f8126d80', fieldMetadataUniversalIdentifier: CREATOR_ON_UGC_ASSET_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 200 },
    { universalIdentifier: '217e27df-37ab-4524-8325-a5873573b800', fieldMetadataUniversalIdentifier: UGC_ASSET_TYPE_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 110 },
    { universalIdentifier: '11ff0e8e-f27c-4428-a96c-e6c0394373ca', fieldMetadataUniversalIdentifier: UGC_ASSET_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 120 },
    { universalIdentifier: '7f114c62-f488-4f85-82ee-fe1b0e942282', fieldMetadataUniversalIdentifier: UGC_ASSET_COST_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 110 },
    { universalIdentifier: 'b623b15d-7891-4c72-910a-b4d20f0de65a', fieldMetadataUniversalIdentifier: UGC_ASSET_FILE_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 180 },
  ],
});
