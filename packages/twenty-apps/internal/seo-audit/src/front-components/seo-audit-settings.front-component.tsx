import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { SETUP_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/setup-front-component-universal-identifier.const';
import { SeoAuditSettings } from 'src/front-components/components/SeoAuditSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: SETUP_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'seo-audit-setup',
  description:
    'Guided setup for SEO Audit: connect Anthropic, choose defaults and run the first audit.',
  component: SeoAuditSettings,
});
