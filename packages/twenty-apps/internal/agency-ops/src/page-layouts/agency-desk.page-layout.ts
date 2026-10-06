import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import { AGENCY_DESK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/agency-desk-front-component-universal-identifier.const';

export const AGENCY_DESK_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  '84483f50-d888-402c-ae4f-2e65de8a8234';

export default definePageLayout({
  universalIdentifier: AGENCY_DESK_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Agency Desk',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: 'e23b00a7-9237-4b13-aa2e-af51ecb98999',
      title: 'Desk',
      position: 0,
      icon: 'IconLayoutDashboard',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: 'd4092096-af08-4904-ac84-af9e4dc35f23',
          title: 'Agency Desk',
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
              AGENCY_DESK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
