import type { Route } from './+types/contact';
import { metaContext, seo } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ContactPage } from '@/components/contact/page';
import { isRateLimited, isValidEmail } from '@/lib/lead-guard.server';
import { submitLeadToTwenty } from '@/lib/twenty.server';
import { buildContactPageSchema, buildBreadcrumbSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	const site = { origin, locale };
	return seo(
		{ matches, location },
		{
			title: t('meta.contact.title'),
			description: t('meta.contact.description'),
			jsonLd: [
				buildContactPageSchema(site, t),
				buildBreadcrumbSchema(site, [
					{ name: t('breadcrumb.home'), path: '/' },
					{ name: t('nav.contact'), path: '/contact' },
				]),
			],
		},
	);
}

export type ContactActionResult =
	| { success: true }
	| { success: false; error: 'required' | 'email' | 'consent' | 'rate' | 'failed' };

export async function action({ request }: Route.ActionArgs): Promise<ContactActionResult> {
	const formData = await request.formData();

	if (String(formData.get('website') || '').trim() !== '') {
		return { success: true };
	}

	if (await isRateLimited(request)) {
		return { success: false, error: 'rate' };
	}

	const name = String(formData.get('name') || '').trim();
	const email = String(formData.get('email') || '').trim();
	const company = String(formData.get('company') || '').trim();
	const message = String(formData.get('message') || '').trim();

	if (!name || !email || !message) {
		return { success: false, error: 'required' };
	}

	if (!isValidEmail(email)) {
		return { success: false, error: 'email' };
	}

	if (formData.get('consent') !== 'on') {
		return { success: false, error: 'consent' };
	}

	const result = await submitLeadToTwenty({
		name,
		email,
		company: company || undefined,
		message,
	});

	if (!result.success) {
		return { success: false, error: 'failed' };
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
