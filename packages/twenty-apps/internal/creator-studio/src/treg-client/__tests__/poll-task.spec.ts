import { describe, expect, it, vi } from 'vitest';

import { pollTask, type TaskState } from 'src/treg-client/poll-task';

describe('pollTask', () => {
  it('waits until the task succeeds', async () => {
    const states: TaskState<string>[] = [
      { state: 'PENDING' },
      { state: 'PENDING' },
      { state: 'SUCCEEDED', result: 'https://cdn/x.png' },
    ];
    const sleep = vi.fn(async () => undefined);

    const result = await pollTask({
      fetchState: async () => states.shift() as TaskState<string>,
      intervalMs: 5000,
      maxWaitMs: 60_000,
      sleep,
    });

    expect(result).toBe('https://cdn/x.png');
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('throws the provider message when the task fails', async () => {
    await expect(
      pollTask({
        fetchState: async () => ({ state: 'FAILED', message: 'upstream unreachable' }),
        intervalMs: 1,
        maxWaitMs: 10,
        sleep: async () => undefined,
      }),
    ).rejects.toThrow('upstream unreachable');
  });

  it('gives up after the maximum wait', async () => {
    await expect(
      pollTask({
        fetchState: async () => ({ state: 'PENDING' }),
        intervalMs: 5,
        maxWaitMs: 10,
        sleep: async () => undefined,
      }),
    ).rejects.toThrow(/did not finish in time/);
  });
});
