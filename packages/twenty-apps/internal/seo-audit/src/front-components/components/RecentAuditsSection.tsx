import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components';
import { Status } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { type RecentSeoAudit } from 'src/front-components/types/recent-seo-audit';
import { getAuditStatusColor } from 'src/front-components/utils/get-audit-status-color.util';

type RecentAuditsSectionProps = {
  audits: RecentSeoAudit[];
};

export const RecentAuditsSection = ({ audits }: RecentAuditsSectionProps) => {
  if (audits.length === 0) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header title="Recent audits" description="Open an audit to see its report and tasks." />
      <ul style={{ margin: 0, padding: 0 }}>
        {audits.map((audit) => (
          <li key={audit.id} style={{ listStyle: 'none' }}>
            <button
              type="button"
              onClick={() =>
                navigate(AppPath.RecordShowPage, {
                  objectNameSingular: 'seoAudit',
                  objectRecordId: audit.id,
                })
              }
              style={{
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                color: themeCssVariables.font.color.primary,
                cursor: 'pointer',
                display: 'flex',
                fontFamily: 'inherit',
                fontSize: themeCssVariables.font.size.md,
                gap: themeCssVariables.spacing[2],
                justifyContent: 'space-between',
                padding: `${themeCssVariables.spacing[2]} 0`,
                textAlign: 'left',
                width: '100%',
              }}
            >
              <span>{audit.name ?? audit.domain ?? 'SEO audit'}</span>
              <span style={{ alignItems: 'center', display: 'flex', gap: themeCssVariables.spacing[2] }}>
                {audit.status === 'DONE' && audit.score !== null && (
                  <span style={{ color: themeCssVariables.font.color.secondary }}>
                    {audit.score}/100 {audit.grade ?? ''}
                  </span>
                )}
                <Status color={getAuditStatusColor(audit.status)}>
                  {audit.status ?? 'UNKNOWN'}
                </Status>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Section.Root>
  );
};
