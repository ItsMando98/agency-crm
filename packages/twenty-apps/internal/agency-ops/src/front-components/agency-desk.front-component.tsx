import { defineFrontComponent } from 'twenty-sdk/define';

import { AGENCY_DESK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/agency-desk-front-component-universal-identifier.const';
import { AgencyDesk } from 'src/front-components/components/AgencyDesk';

export default defineFrontComponent({
  universalIdentifier: AGENCY_DESK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'agency-desk',
  description:
    'Approval inbox and agent queue overview. Approve or reject what the agents are waiting on.',
  component: AgencyDesk,
});
