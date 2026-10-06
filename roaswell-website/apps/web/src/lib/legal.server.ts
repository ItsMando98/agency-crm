import { interpolate } from '@/i18n/context';
import { loadLegalMessages } from '@/i18n/messages.server';
import { getCompanyProfile, getMissingLegalFields, type CompanyProfile } from '@/data/company.server';

export type LegalSection = { key: string; title: string; body: string };

type LegalMessages = Record<string, string>;

function address(profile: CompanyProfile): string {
	return [
		[profile.legalName, profile.legalForm].filter(Boolean).join(' '),
		profile.street,
		[profile.postalCode, profile.city].filter(Boolean).join(' '),
		profile.country,
	]
		.filter(Boolean)
		.join('\n');
}

function labelled(messages: LegalMessages, entries: Array<[string, string]>): string {
	return entries
		.filter(([, value]) => value)
		.map(([key, value]) => `${messages[key] ?? key}: ${value}`)
		.join('\n');
}

export async function buildImprint(locale: string) {
	const messages = await loadLegalMessages(locale);
	const profile = getCompanyProfile();
	const missing = getMissingLegalFields(profile);

	if (missing.length > 0 && process.env.NODE_ENV === 'production') {
		console.warn(`[legal] Imprint is incomplete, missing: ${missing.join(', ')}`);
	}

	const candidates: Array<LegalSection | null> = [
		{ key: 'provider', title: messages['imprint.provider.title'], body: address(profile) },
		profile.representative
			? { key: 'representative', title: messages['imprint.representative.title'], body: profile.representative }
			: null,
		{
			key: 'contact',
			title: messages['imprint.contact.title'],
			body: labelled(messages, [
				['imprint.label.email', profile.email],
				['imprint.label.phone', profile.phone],
			]),
		},
		profile.registerCourt || profile.registerNumber
			? {
					key: 'register',
					title: messages['imprint.register.title'],
					body: labelled(messages, [
						['imprint.label.registerCourt', profile.registerCourt],
						['imprint.label.registerNumber', profile.registerNumber],
					]),
				}
			: null,
		profile.vatId
			? { key: 'vat', title: messages['imprint.vat.title'], body: `${messages['imprint.vat.label']}: ${profile.vatId}` }
			: null,
		profile.responsibleForContent
			? { key: 'content', title: messages['imprint.content.title'], body: profile.responsibleForContent }
			: null,
		{ key: 'dispute', title: messages['imprint.dispute.title'], body: messages['imprint.dispute.body'] },
		{ key: 'liability', title: messages['imprint.liability.title'], body: messages['imprint.liability.body'] },
		{ key: 'links', title: messages['imprint.links.title'], body: messages['imprint.links.body'] },
	];

	return {
		eyebrow: messages['imprint.eyebrow'],
		title: messages['imprint.title'],
		lede: messages['imprint.lede'],
		notice:
			missing.length > 0 && process.env.NODE_ENV !== 'production'
				? `Imprint incomplete. Set: ${missing.join(', ')}`
				: undefined,
		sections: candidates.filter((section): section is LegalSection => section !== null),
	};
}

const PRIVACY_SECTIONS = [
	'controller',
	'hosting',
	'contact',
	'crm',
	'tracking',
	'links',
	'retention',
	'rights',
	'changes',
] as const;

export async function buildPrivacy(locale: string) {
	const messages = await loadLegalMessages(locale);
	const profile = getCompanyProfile();
	const variables = {
		controller: address(profile) || 'ROASWELL',
		email: profile.privacyContactEmail,
		hosting: profile.hostingProvider || messages['privacy.hosting.defaultProvider'],
	};

	return {
		eyebrow: messages['privacy.eyebrow'],
		title: messages['privacy.title'],
		lede: messages['privacy.lede'],
		sections: PRIVACY_SECTIONS.map(key => ({
			key,
			title: messages[`privacy.${key}.title`],
			body: interpolate(messages[`privacy.${key}.body`], variables),
		})),
	};
}
