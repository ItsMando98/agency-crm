import { apiError, withApi } from '@/lib/api.server';
import { submitLeadToTwenty } from '@/lib/twenty.server';

export const action = withApi(async ({ request }: { request: Request }) => {
	if (request.method !== 'POST') {
		return apiError(405, 'Method not allowed');
	}

	let payload: any;
	const contentType = request.headers.get('content-type') || '';

	if (contentType.includes('application/json')) {
		try {
			payload = await request.json();
		} catch {
			return apiError(400, 'Invalid JSON body');
		}
	} else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
		const formData = await request.formData();
		payload = {
			name: formData.get('name'),
			email: formData.get('email'),
			company: formData.get('company'),
			message: formData.get('message'),
		};
	} else {
		return apiError(415, 'Unsupported Media Type');
	}

	const name = typeof payload?.name === 'string' ? payload.name.trim() : '';
	const email = typeof payload?.email === 'string' ? payload.email.trim() : '';
	const company = typeof payload?.company === 'string' ? payload.company.trim() : undefined;
	const message = typeof payload?.message === 'string' ? payload.message.trim() : '';

	if (!name || !email || !message) {
		return apiError(400, 'Missing required fields: name, email, and message are required');
	}

	if (!email.includes('@') || !email.includes('.')) {
		return apiError(400, 'Invalid email address format');
	}

	const result = await submitLeadToTwenty({
		name,
		email,
		company,
		message,
	});

	if (!result.success) {
		return Response.json({ success: false, error: result.error || 'Failed to submit inquiry' }, { status: 500 });
	}

	return Response.json({ success: true, message: 'Inquiry received successfully' }, { status: 201 });
});
