import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit-task.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'ef0c4320-77fe-4318-8bd2-06777edca9d3',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER,
});
