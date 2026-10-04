/**
 * Öffentliche Origin der Seite, robust abgeleitet aus Request-Headern (Reverse-Proxy aware).
 * Stellt sicher, dass hinter Traefik / SSL-Termination immer das korrekte öffentliche
 * Protokoll (https://) verwendet wird.
 */
export function siteOrigin(request: Request): string {
	const protoHeader = request.headers.get('x-forwarded-proto');
	const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host');

	if (hostHeader) {
		const isLocal =
			hostHeader.includes('localhost') ||
			hostHeader.includes('127.0.0.1') ||
			hostHeader.startsWith('10.') ||
			hostHeader.startsWith('192.168.');

		const protocol = isLocal ? (protoHeader || 'http') : 'https';
		return `${protocol}://${hostHeader}`;
	}

	const url = new URL(request.url);
	const isLocal =
		url.hostname.includes('localhost') ||
		url.hostname.includes('127.0.0.1') ||
		url.hostname.startsWith('10.') ||
		url.hostname.startsWith('192.168.');

	const protocol = isLocal ? url.protocol.replace(':', '') : 'https';
	return `${protocol}://${url.host}`;
}
