import type { Route } from './+types/contact';
import type { ActionFunctionArgs } from 'react-router';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ContactPage } from '@/components/contact/page';
import { submitLeadToTwenty } from '@/lib/twenty.server';
import { buildContactPageSchema, buildBreadcrumbSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: 'Contact — Start a Conversation with ROASWELL',
			description:
				'Tell us where you are. Let’s work out where you could go. Reach the ROASWELL studio at hello@roaswell.com.',
			jsonLd: [
				buildContactPageSchema(origin),
				buildBreadcrumbSchema(origin, [
					{ name: 'Home', path: '/' },
					{ name: 'Contact', path: '/contact' },
				]),
			],
		},
	);
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const name = String(formData.get('name') || '').trim();
	const email = String(formData.get('email') || '').trim();
	const company = String(formData.get('company') || '').trim();
	const message = String(formData.get('message') || '').trim();

	if (!name || !email || !message) {
		return {
			success: false,
			error: 'Please fill in all required fields (Name, Email, Message).',
		};
	}

	if (!email.includes('@') || !email.includes('.')) {
		return {
			success: false,
			error: 'Please provide a valid email address.',
		};
	}

	const result = await submitLeadToTwenty({
		name,
		email,
		company: company || undefined,
		message,
	});

	if (!result.success) {
		return {
			success: false,
			error: result.error || 'Failed to submit inquiry. Please reach out via hello@roaswell.com.',
		};
	}

	return { success: true };
}

export default function ContactRoute() {
	return (
		<>
			<SiteHeader />
			<main>
				<ContactPage />
			</main>
			<SiteFooter />
		</>
	);
}
