import { type AuditTask } from 'src/types/audit-task';

type TaskHorizon = 'WEEK' | 'MONTH' | 'QUARTER';

export const getTaskHorizon = ({
  priority,
  effort,
}: Pick<AuditTask, 'priority' | 'effort'>): TaskHorizon => {
  if (priority === 'CRITICAL' || (priority === 'HIGH' && effort === 'LOW')) {
    return 'WEEK';
  }

  if (priority === 'HIGH' || (priority === 'MEDIUM' && effort === 'LOW')) {
    return 'MONTH';
  }

  return 'QUARTER';
};
