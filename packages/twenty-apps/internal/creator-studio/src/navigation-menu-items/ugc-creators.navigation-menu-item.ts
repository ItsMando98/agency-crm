import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { UGC_CREATOR_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-creator.object';

export default defineNavigationMenuItem({
  universalIdentifier: '3b53641b-0716-47a2-8f09-3f27e4c3dc69',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: UGC_CREATOR_UNIVERSAL_IDENTIFIER,
});
