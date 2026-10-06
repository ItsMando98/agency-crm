import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  DEFAULT_TASK_LIMIT,
  MAX_FETCHED_TASKS,
  MAX_TASK_LIMIT,
} from 'src/constants/agent-tool.const';
import { listSeoAuditTasksInputSchema } from 'src/logic-functions/schemas/list-seo-audit-tasks-input.schema';
import { clampLimit } from 'src/utils/clamp-limit.util';
import { mapTaskNode, type SeoTaskView } from 'src/utils/map-task-node.util';
import { sortTasksByPriority } from 'src/utils/sort-tasks-by-priority.util';

type ListSeoAuditTasksInput = {
  auditId: string;
  status?: string;
  priority?: string;
  area?: string;
  limit?: number;
};

const handler = async (parameters: ListSeoAuditTasksInput) => {
  const client = new CoreApiClient();
  const filter: Record<string, unknown> = { seoAuditId: { eq: parameters.auditId } };

  for (const key of ['status', 'priority', 'area'] as const) {
    if (parameters[key] !== undefined) {
      filter[key] = { eq: parameters[key] };
    }
  }

  const { seoAuditTasks } = await client.query({
    seoAuditTasks: {
      __args: { filter, first: MAX_FETCHED_TASKS },
      edges: {
        node: {
          id: true,
          ruleId: true,
          name: true,
          description: true,
          priority: true,
          effort: true,
          area: true,
          source: true,
          status: true,
          affectedUrls: true,
        },
      },
    },
  });
  const tasks = sortTasksByPriority(
    ((seoAuditTasks?.edges ?? []) as { node: unknown }[])
      .map(({ node }) => mapTaskNode(node))
      .filter((task): task is SeoTaskView => task !== null),
  );
  const limit = clampLimit(parameters.limit, DEFAULT_TASK_LIMIT, MAX_TASK_LIMIT);

  return {
    success: true,
    message:
      tasks.length === 0
        ? 'No tasks match'
        : `Showing ${Math.min(limit, tasks.length)} of ${tasks.length} tasks, most important first`,
    total: tasks.length,
    tasks: tasks.slice(0, limit),
  };
};

export default defineLogicFunction({
  universalIdentifier: '0555935e-93b1-438e-b8fe-d6d2d89c0eaa',
  name: 'list_seo_audit_tasks',
  description:
    'Lists the action items of an SEO audit, most important first and cheapest fix first within a priority. Each task has an id, a description with the recommended fix, the affected URLs, priority, effort, area, source (RULE means measured by code, CLASSIFIER means judged by a model) and status. Use the ids with update_seo_audit_tasks.',
  timeoutSeconds: 30,
  toolTriggerSettings: { inputSchema: listSeoAuditTasksInputSchema },
  handler,
});
