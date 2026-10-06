import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { MAX_TASK_UPDATES_PER_CALL } from 'src/constants/agent-tool.const';
import { SEO_AUDIT_TASK_STATUS } from 'src/constants/seo-audit.constants';
import { updateSeoAuditTasksInputSchema } from 'src/logic-functions/schemas/update-seo-audit-tasks-input.schema';

type UpdateSeoAuditTasksInput = {
  tasks: { id: string; status: string }[];
};

type TaskUpdateResult = {
  id: string;
  status: 'UPDATED' | 'FAILED';
  error?: string;
};

const VALID_STATUSES: string[] = Object.values(SEO_AUDIT_TASK_STATUS);

const handler = async (parameters: UpdateSeoAuditTasksInput) => {
  const tasks = Array.isArray(parameters.tasks) ? parameters.tasks : [];

  if (tasks.length === 0 || tasks.length > MAX_TASK_UPDATES_PER_CALL) {
    return {
      success: false,
      message: `Send between 1 and ${MAX_TASK_UPDATES_PER_CALL} tasks`,
      updatedCount: 0,
      failedCount: 0,
      results: [] as TaskUpdateResult[],
    };
  }

  const client = new CoreApiClient();
  const results: TaskUpdateResult[] = [];

  for (const task of tasks) {
    if (typeof task?.id !== 'string' || !VALID_STATUSES.includes(task.status)) {
      results.push({
        id: String(task?.id),
        status: 'FAILED',
        error: `status must be one of ${VALID_STATUSES.join(', ')}`,
      });
      continue;
    }

    try {
      await client.mutation({
        updateSeoAuditTask: {
          __args: { id: task.id, data: { status: task.status } },
          id: true,
        },
      });
      results.push({ id: task.id, status: 'UPDATED' });
    } catch (error) {
      results.push({
        id: task.id,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Update failed',
      });
    }
  }

  const updatedCount = results.filter((result) => result.status === 'UPDATED').length;
  const failedCount = results.length - updatedCount;

  return {
    success: failedCount === 0,
    message: `Updated ${updatedCount} tasks, ${failedCount} failed`,
    updatedCount,
    failedCount,
    results,
  };
};

export default defineLogicFunction({
  universalIdentifier: '418fb541-7ad7-4b44-afd2-a15bdca8ae9c',
  name: 'update_seo_audit_tasks',
  description:
    'Changes the status of SEO audit tasks, for example to IN_PROGRESS when starting work and DONE once a fix is live. Takes several tasks at once and reports per task whether it worked. Only set DONE for fixes that are actually deployed. A new audit confirms whether a fix worked.',
  timeoutSeconds: 60,
  toolTriggerSettings: { inputSchema: updateSeoAuditTasksInputSchema },
  handler,
});
