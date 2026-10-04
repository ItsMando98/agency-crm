export function apiError(status: number, message: string): Response {
	return Response.json({ error: message }, { status });
}

type Handler = (args: unknown) => Promise<Response> | Response;

/** Fängt unerwartete Fehler ab und antwortet immer mit JSON. */
export function withApi(handler: Handler): Handler {
	return async args => {
		try {
			return await handler(args);
		} catch (error) {
			console.error(error);
			return apiError(500, 'Internal server error');
		}
	};
}
