import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { SHOWING_PLANNER_PAGE_LAYOUT_ID } from '../page-layouts/showing-planner.page-layout';

export default defineNavigationMenuItem({
  universalIdentifier: 'c8406f68-db95-4826-9e14-214bf9a358b0',
  name: 'Showing Planner',
  icon: 'IconLayoutDashboard',
  position: 3,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: SHOWING_PLANNER_PAGE_LAYOUT_ID,
});
