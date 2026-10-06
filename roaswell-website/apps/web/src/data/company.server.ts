export type CompanyProfile = {
	legalName: string;
	legalForm: string;
	street: string;
	postalCode: string;
	city: string;
	country: string;
	representative: string;
	email: string;
	phone: string;
	registerCourt: string;
	registerNumber: string;
	vatId: string;
	responsibleForContent: string;
	privacyContactEmail: string;
	hostingProvider: string;
};

export type FounderProfile = {
	name: string;
	role: string;
	location: string;
	photo: string;
	bio: string;
	linkedIn: string;
};

function read(name: string): string {
	return (process.env[name] ?? '').trim();
}

export function getCompanyProfile(): CompanyProfile {
	const email = read('COMPANY_EMAIL') || 'hello@roaswell.com';
	return {
		legalName: read('COMPANY_LEGAL_NAME'),
		legalForm: read('COMPANY_LEGAL_FORM'),
		street: read('COMPANY_STREET'),
		postalCode: read('COMPANY_POSTAL_CODE'),
		city: read('COMPANY_CITY'),
		country: read('COMPANY_COUNTRY'),
		representative: read('COMPANY_REPRESENTATIVE'),
		email,
		phone: read('COMPANY_PHONE'),
		registerCourt: read('COMPANY_REGISTER_COURT'),
		registerNumber: read('COMPANY_REGISTER_NUMBER'),
		vatId: read('COMPANY_VAT_ID'),
		responsibleForContent: read('COMPANY_RESPONSIBLE_FOR_CONTENT'),
		privacyContactEmail: read('COMPANY_PRIVACY_EMAIL') || email,
		hostingProvider: read('COMPANY_HOSTING_PROVIDER'),
	};
}

export function getFounderProfile(): FounderProfile | null {
	const name = read('FOUNDER_NAME');
	if (!name) return null;
	return {
		name,
		role: read('FOUNDER_ROLE'),
		location: read('FOUNDER_LOCATION'),
		photo: read('FOUNDER_PHOTO'),
		bio: read('FOUNDER_BIO'),
		linkedIn: read('FOUNDER_LINKEDIN'),
	};
}

export function getBookingUrl(): string | null {
	const url = read('BOOKING_URL');
	return /^https:\/\//.test(url) ? url : null;
}

export function getMissingLegalFields(profile: CompanyProfile): string[] {
	const required: Array<keyof CompanyProfile> = ['legalName', 'street', 'postalCode', 'city', 'country', 'representative'];
	return required.filter(field => !profile[field]);
}
