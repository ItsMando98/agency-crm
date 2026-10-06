type RecordedRequest = {
  url: string;
  method: string;
  authorization: string | null;
  body: unknown;
};

type RespondWith = (request: RecordedRequest) => { status?: number; json: unknown };

export const createRecordingFetch = (respond: RespondWith) => {
  const requests: RecordedRequest[] = [];

  const fetchImplementation = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const request: RecordedRequest = {
      url: typeof input === 'string' ? input : input.toString(),
      method: init?.method ?? 'GET',
      authorization: headers.get('authorization'),
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    };

    requests.push(request);

    const { status = 200, json } = respond(request);

    return new Response(JSON.stringify(json), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;

  return { fetchImplementation, requests };
};
