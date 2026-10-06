import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-keyword-opportunity.object';

export default defineNavigationMenuItem({
  universalIdentifier: '869c0058-419a-4df9-9a0f-9668f0c53300',
  position: 2,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER,
});
