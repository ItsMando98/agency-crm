type EnvelopeOptions = {
  cost?: number;
  statusCode?: number;
  taskStatusCode?: number;
  statusMessage?: string;
};

export const buildDataForSeoEnvelope = (
  result: unknown,
  {
    cost = 0.01,
    statusCode = 20000,
    taskStatusCode = 20000,
    statusMessage = 'Ok.',
  }: EnvelopeOptions = {},
) => ({
  version: '0.1.20240801',
  status_code: statusCode,
  status_message: statusMessage,
  cost,
  tasks_count: 1,
  tasks_error: taskStatusCode === 20000 ? 0 : 1,
  tasks: [
    {
      id: 'task-1',
      status_code: taskStatusCode,
      status_message: statusMessage,
      cost,
      result: result === null ? null : [result],
    },
  ],
});
