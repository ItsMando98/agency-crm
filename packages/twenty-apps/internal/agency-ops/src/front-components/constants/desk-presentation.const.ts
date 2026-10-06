import { type AgentTaskStatus } from 'src/front-components/hooks/use-agent-task-counts';

type StatusColor =
  | 'blue'
  | 'purple'
  | 'orange'
  | 'green'
  | 'red'
  | 'gray'
  | 'sky'
  | 'yellow';

type Presentation = { label: string; color: StatusColor };

// Mirrors the select options on the agentTask and approval objects.
export const TASK_STATUS_PRESENTATION: Record<AgentTaskStatus, Presentation> = {
  WAITING_APPROVAL: { label: 'Needs input', color: 'orange' },
  QUEUED: { label: 'Queued', color: 'blue' },
  RUNNING: { label: 'Running', color: 'purple' },
  FAILED: { label: 'Failed', color: 'red' },
  DONE: { label: 'Done', color: 'green' },
  CANCELLED: { label: 'Cancelled', color: 'gray' },
};

export const TASK_STATUS_DISPLAY_ORDER: AgentTaskStatus[] = [
  'WAITING_APPROVAL',
  'QUEUED',
  'RUNNING',
  'FAILED',
  'DONE',
  'CANCELLED',
];

export const APPROVAL_CATEGORY_PRESENTATION: Record<string, Presentation> = {
  CALL: { label: 'Call', color: 'sky' },
  PAYMENT: { label: 'Payment', color: 'red' },
  CONTRACT: { label: 'Contract', color: 'purple' },
  AD_BUDGET: { label: 'Ad budget', color: 'orange' },
  FIRST_CONTACT: { label: 'First contact', color: 'blue' },
  PUBLISH: { label: 'Publish', color: 'green' },
  OTHER: { label: 'Other', color: 'gray' },
};

export const FALLBACK_CATEGORY_PRESENTATION: Presentation = {
  label: 'Other',
  color: 'gray',
};
