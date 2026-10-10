export type TaskState<TResult> =
  | { state: 'PENDING' }
  | { state: 'SUCCEEDED'; result: TResult }
  | { state: 'FAILED'; message: string };

type PollTaskParams<TResult> = {
  fetchState: () => Promise<TaskState<TResult>>;
  intervalMs: number;
  maxWaitMs: number;
  sleep?: (milliseconds: number) => Promise<void>;
};

const defaultSleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const pollTask = async <TResult>({
  fetchState,
  intervalMs,
  maxWaitMs,
  sleep = defaultSleep,
}: PollTaskParams<TResult>): Promise<TResult> => {
  let waitedMs = 0;

  for (;;) {
    const state = await fetchState();

    if (state.state === 'SUCCEEDED') {
      return state.result;
    }

    if (state.state === 'FAILED') {
      throw new Error(state.message);
    }

    if (waitedMs >= maxWaitMs) {
      throw new Error('The generation did not finish in time.');
    }

    await sleep(intervalMs);
    waitedMs += intervalMs;
  }
};
