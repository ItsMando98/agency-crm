import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { RowButton } from 'src/front-components/components/RowButton';
import { type ShowingSummary } from 'src/front-components/types/showing-summary';
import { formatPersonName } from 'src/front-components/utils/format-person-name.util';

type ShowingRowProps = {
  showing: ShowingSummary;
  badgeLabel: string;
  badgeColor: 'gray' | 'orange';
};

export const ShowingRow = ({ showing, badgeLabel, badgeColor }: ShowingRowProps) => {
  const propertyName = showing.property?.name ?? showing.name ?? 'Showing';
  const buyerName = formatPersonName(showing.buyer?.name, 'Unknown buyer');
  const agentName = formatPersonName(showing.agent?.name, 'No agent');

  return (
    <RowButton
      ariaLabel={`Open showing at ${propertyName}`}
      onClick={() =>
        navigate(AppPath.RecordShowPage, {
          objectNameSingular: 'showing',
          objectRecordId: showing.id,
        })
      }
    >
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: themeCssVariables.font.weight.medium }}>{propertyName}</span>
        <span
          style={{
            color: themeCssVariables.font.color.tertiary,
            fontSize: themeCssVariables.font.size.sm,
          }}
        >
          {buyerName} with {agentName}
        </span>
      </span>
      <Status color={badgeColor}>{badgeLabel}</Status>
    </RowButton>
  );
};
