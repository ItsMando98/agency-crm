import { defineView, ViewType } from 'twenty-sdk/define';

import { COMPANY_ON_UGC_CREATOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/company-on-ugc-creator.field';
import {
  UGC_CREATOR_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_CREATOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_CREATOR_NICHE_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_CREATOR_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  UGC_CREATOR_UNIVERSAL_IDENTIFIER,
} from 'src/objects/ugc-creator.object';

export default defineView({
  universalIdentifier: '3546ae91-cc52-4c7c-a716-9ad8949dc7a9',
  name: 'All UGC creators',
  objectUniversalIdentifier: UGC_CREATOR_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconUserStar',
  position: 0,
  fields: [
    { universalIdentifier: '6793ba9a-926e-400a-99af-96854f3d8ad5', fieldMetadataUniversalIdentifier: UGC_CREATOR_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '46cf9313-3016-42a7-b318-326d4de6655d', fieldMetadataUniversalIdentifier: UGC_CREATOR_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 120 },
    { universalIdentifier: '3d01351b-eeab-4b12-ab2b-ced421ff0e50', fieldMetadataUniversalIdentifier: COMPANY_ON_UGC_CREATOR_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 200 },
    { universalIdentifier: '02b1182f-31d2-42aa-abee-e67b76bce6bc', fieldMetadataUniversalIdentifier: UGC_CREATOR_NICHE_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 200 },
    { universalIdentifier: '0b1ef4d4-7c5d-451d-a8cc-2d9e39118887', fieldMetadataUniversalIdentifier: UGC_CREATOR_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 110 },
  ],
});
