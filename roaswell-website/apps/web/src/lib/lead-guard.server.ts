import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({ points: 5, duration: 600 });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
	return email.length <= 254 && EMAIL_PATTERN.test(email);
}

function clientAddress(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for');
	return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function isRateLimited(request: Request): Promise<boolean> {
	try {
		await limiter.consume(clientAddress(request));
		return false;
	} catch {
		return true;
	}
}
