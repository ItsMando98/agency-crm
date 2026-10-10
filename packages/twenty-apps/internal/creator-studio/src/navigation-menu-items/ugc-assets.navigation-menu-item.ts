import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { UGC_ASSET_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-asset.object';

export default defineNavigationMenuItem({
  universalIdentifier: '4c9d87d9-17e2-4338-8b9b-990d78142d94',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: UGC_ASSET_UNIVERSAL_IDENTIFIER,
});
