export const getAuditStatusColor = (
  status: string | null,
): 'blue' | 'purple' | 'green' | 'red' | 'gray' => {
  switch (status) {
    case 'QUEUED':
      return 'blue';
    case 'RUNNING':
      return 'purple';
    case 'DONE':
      return 'green';
    case 'FAILED':
      return 'red';
    default:
      return 'gray';
  }
};
