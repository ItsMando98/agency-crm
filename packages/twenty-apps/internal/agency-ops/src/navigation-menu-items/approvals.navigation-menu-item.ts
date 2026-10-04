import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { APPROVAL_UNIVERSAL_IDENTIFIER } from 'src/objects/approval.object';

export default defineNavigationMenuItem({
  universalIdentifier: '9ba70bb6-592b-4444-97f3-27c24efce06a',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: APPROVAL_UNIVERSAL_IDENTIFIER,
});
