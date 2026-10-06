import { defineSettingsMenuItem } from 'twenty-sdk/define';

import { SETUP_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/setup-front-component-universal-identifier.const';

export default defineSettingsMenuItem({
  universalIdentifier: '59656d97-04d9-449a-9bb1-b1cea1485497',
  frontComponentUniversalIdentifier: SETUP_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'Setup',
  icon: 'IconRocket',
  position: 1,
  scope: 'WORKSPACE',
});
