import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SEO_AUDIT_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit.object';

export default defineNavigationMenuItem({
  universalIdentifier: '6b6de193-aef4-4456-9d46-6ab9720a7614',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: SEO_AUDIT_UNIVERSAL_IDENTIFIER,
});
