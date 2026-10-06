import 'twenty-ui/style.css';

import { Callout, Section } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

import { ShowingRow } from 'src/front-components/components/ShowingRow';
import { useShowingPlanner } from 'src/front-components/hooks/use-showing-planner';
import { formatShowingTime } from 'src/front-components/utils/format-showing-time.util';
import { getFollowUpReason } from 'src/front-components/utils/get-follow-up-reason.util';
import { groupShowingsByDay } from 'src/front-components/utils/group-showings-by-day.util';

const getUpcomingDescription = (showingCount: number): string =>
  showingCount === 0
    ? 'No showings are scheduled. New ones appear here as soon as they are booked.'
    : `${showingCount} scheduled`;

const getFollowUpDescription = (showingCount: number): string =>
  showingCount === 0
    ? 'Everything is up to date.'
    : `${showingCount} past showings need an update`;

export const ShowingPlanner = () => {
  const { upcomingShowings, followUpShowings, isLoading, hasError } = useShowingPlanner();

  if (isLoading) {
    return <Callout variant="neutral" title="Loading the planner" />;
  }

  if (hasError) {
    return (
      <Callout
        variant="error"
        title="The planner could not be loaded"
        description="Please try again later."
      />
    );
  }

  const dayGroups = groupShowingsByDay(upcomingShowings, new Date());

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[8],
        padding: themeCssVariables.spacing[4],
        width: '100%',
      }}
    >
      <Section.Root>
        <Section.Header
          title="Upcoming showings"
          description={getUpcomingDescription(upcomingShowings.length)}
        />
        {dayGroups.map((group) => (
          <div
            key={group.dayKey}
            role="group"
            aria-label={group.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: themeCssVariables.spacing[3],
            }}
          >
            <span
              style={{
                color: themeCssVariables.font.color.tertiary,
                fontSize: themeCssVariables.font.size.sm,
                fontWeight: themeCssVariables.font.weight.medium,
                padding: `0 ${themeCssVariables.spacing[2]}`,
              }}
            >
              {group.label}
            </span>
            {group.showings.map((showing) => (
              <ShowingRow
                key={showing.id}
                showing={showing}
                badgeLabel={formatShowingTime(showing.scheduledAt)}
                badgeColor="gray"
              />
            ))}
          </div>
        ))}
      </Section.Root>
      <Section.Root>
        <Section.Header
          title="Needs follow-up"
          description={getFollowUpDescription(followUpShowings.length)}
        />
        {followUpShowings.map((showing) => (
          <ShowingRow
            key={showing.id}
            showing={showing}
            badgeLabel={getFollowUpReason(showing) ?? ''}
            badgeColor="orange"
          />
        ))}
      </Section.Root>
    </div>
  );
};
