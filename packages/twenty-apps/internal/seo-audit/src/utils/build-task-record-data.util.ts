import { type AuditTask } from 'src/types/audit-task';

export const buildTaskRecordData = (seoAuditId: string, task: AuditTask) => ({
  seoAuditId,
  name: task.name,
  description: task.description,
  priority: task.priority,
  effort: task.effort,
  area: task.area,
  source: task.source,
  affectedUrls: task.affectedUrls.join('\n'),
});
