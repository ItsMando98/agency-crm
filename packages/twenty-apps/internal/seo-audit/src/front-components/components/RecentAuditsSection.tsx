import { AppPath, navigate } from 'twenty-sdk/front-component';
import { IconChevronRight } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { RowButton } from 'src/front-components/components/RowButton';
import { SettingsPanel } from 'src/front-components/components/SettingsPanel';
import { SettingsSection } from 'src/front-components/components/SettingsSection';
import { type RecentSeoAudit } from 'src/front-components/types/recent-seo-audit';
import { getAuditStatusColor } from 'src/front-components/utils/get-audit-status-color.util';

type RecentAuditsSectionProps = {
  audits: RecentSeoAudit[];
  isLoading?: boolean;
};

export const RecentAuditsSection = ({
  audits,
  isLoading = false,
}: RecentAuditsSectionProps) => {
  if (isLoading) {
    return (
      <SettingsPanel>
        <SettingsSection title="Recent audits" description="Loading the latest audits.">
          <div
            aria-hidden
            style={{
              background: themeCssVariables.background.transparent.light,
              borderRadius: themeCssVariables.border.radius.sm,
              height: 44,
            }}
          />
        </SettingsSection>
      </SettingsPanel>
    );
  }

  if (audits.length === 0) {
    return (
      <SettingsPanel>
        <SettingsSection
          title="Recent audits"
          description="No audits yet. Your first one appears here as soon as it is queued."
        />
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel>
      <SettingsSection title="Recent audits" description="Open an audit to see its report and tasks.">
        <ul style={{ margin: 0, padding: 0 }}>
          {audits.map((audit) => (
            <li key={audit.id} style={{ listStyle: 'none' }}>
              <RowButton
                onClick={() =>
                  navigate(AppPath.RecordShowPage, {
                    objectNameSingular: 'seoAudit',
                    objectRecordId: audit.id,
                  })
                }
              >
                <span
                  style={{
                    color: themeCssVariables.font.color.primary,
                    fontWeight: themeCssVariables.font.weight.medium,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {audit.name ?? audit.domain ?? 'SEO audit'}
                </span>
                <span
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexShrink: 0,
                    gap: themeCssVariables.spacing[2],
                  }}
                >
                  {audit.status === 'DONE' && audit.score !== null && (
                    <span
                      style={{
                        color: themeCssVariables.font.color.secondary,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {audit.score}/100 {audit.grade ?? ''}
                    </span>
                  )}
                  <Status color={getAuditStatusColor(audit.status)}>
                    {audit.status ?? 'UNKNOWN'}
                  </Status>
                  <IconChevronRight size={16} color={themeCssVariables.font.color.tertiary} />
                </span>
              </RowButton>
            </li>
          ))}
        </ul>
      </SettingsSection>
    </SettingsPanel>
  );
};
