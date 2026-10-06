import { defineFrontComponent } from 'twenty-sdk/define';

import { SHOWING_PLANNER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/showing-planner-front-component-universal-identifier.const';
import { ShowingPlanner } from 'src/front-components/components/ShowingPlanner';

export default defineFrontComponent({
  universalIdentifier: SHOWING_PLANNER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'showing-planner',
  description:
    'Upcoming showings grouped by day, plus past showings that still need an outcome or a buyer rating.',
  component: ShowingPlanner,
});
