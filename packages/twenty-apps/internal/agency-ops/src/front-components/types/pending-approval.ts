export type PendingApproval = {
  id: string;
  name?: string | null;
  category?: string | null;
  summary?: string | null;
  proposedAction?: string | null;
  agentTask?: { id: string; name?: string | null } | null;
};
