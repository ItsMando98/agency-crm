import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { AGENT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/agent-task.object';

export default defineNavigationMenuItem({
  universalIdentifier: '4a9ad828-8fa5-4a1d-ad8e-f2302b3fe822',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: AGENT_TASK_UNIVERSAL_IDENTIFIER,
});
