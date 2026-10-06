import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import { SHOWING_PLANNER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '../constants/showing-planner-front-component-universal-identifier.const';

export const SHOWING_PLANNER_PAGE_LAYOUT_ID =
  'de4ae6cf-a01a-4550-b4f6-6282d9032361';

export default definePageLayout({
  universalIdentifier: SHOWING_PLANNER_PAGE_LAYOUT_ID,
  name: 'Showing Planner',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: 'c37a4d22-3029-490e-ba87-d096ec44b240',
      title: 'Planner',
      position: 0,
      icon: 'IconLayoutDashboard',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: 'b9d3e50e-09cd-4c54-9451-fff18237ab94',
          title: 'Showing Planner',
          type: 'FRONT_COMPONENT',
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 0,
            column: 0,
            rowSpan: 12,
            columnSpan: 12,
          },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              SHOWING_PLANNER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
