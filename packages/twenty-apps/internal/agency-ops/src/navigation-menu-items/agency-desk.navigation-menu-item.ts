import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { AGENCY_DESK_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/page-layouts/agency-desk.page-layout';

export default defineNavigationMenuItem({
  universalIdentifier: 'ab818254-e405-424e-879e-99c64f7c1b3b',
  name: 'Agency Desk',
  icon: 'IconLayoutDashboard',
  position: 2,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: AGENCY_DESK_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
});
