export type LocaleDefinition = {
	code: string;
	hreflang: string;
	name: string;
	direction: 'ltr' | 'rtl';
};

export const DEFAULT_LOCALE = 'en';

export const LOCALES: readonly LocaleDefinition[] = [
	{ code: 'en', hreflang: 'en', name: 'English', direction: 'ltr' },
	{ code: 'de', hreflang: 'de', name: 'Deutsch', direction: 'ltr' },
	{ code: 'fr', hreflang: 'fr', name: 'Français', direction: 'ltr' },
	{ code: 'es', hreflang: 'es', name: 'Español', direction: 'ltr' },
	{ code: 'it', hreflang: 'it', name: 'Italiano', direction: 'ltr' },
	{ code: 'pt', hreflang: 'pt', name: 'Português', direction: 'ltr' },
	{ code: 'nl', hreflang: 'nl', name: 'Nederlands', direction: 'ltr' },
	{ code: 'pl', hreflang: 'pl', name: 'Polski', direction: 'ltr' },
	{ code: 'ru', hreflang: 'ru', name: 'Русский', direction: 'ltr' },
	{ code: 'ja', hreflang: 'ja', name: '日本語', direction: 'ltr' },
	{ code: 'ko', hreflang: 'ko', name: '한국어', direction: 'ltr' },
	{ code: 'zh', hreflang: 'zh-Hans', name: '简体中文', direction: 'ltr' },
	{ code: 'zh-hant', hreflang: 'zh-Hant', name: '繁體中文', direction: 'ltr' },
	{ code: 'tr', hreflang: 'tr', name: 'Türkçe', direction: 'ltr' },
	{ code: 'ar', hreflang: 'ar', name: 'العربية', direction: 'rtl' },
	{ code: 'hi', hreflang: 'hi', name: 'हिन्दी', direction: 'ltr' },
	{ code: 'id', hreflang: 'id', name: 'Bahasa Indonesia', direction: 'ltr' },
	{ code: 'vi', hreflang: 'vi', name: 'Tiếng Việt', direction: 'ltr' },
	{ code: 'th', hreflang: 'th', name: 'ไทย', direction: 'ltr' },
	{ code: 'he', hreflang: 'he', name: 'עברית', direction: 'rtl' },
	{ code: 'uk', hreflang: 'uk', name: 'Українська', direction: 'ltr' },
	{ code: 'sv', hreflang: 'sv', name: 'Svenska', direction: 'ltr' },
	{ code: 'da', hreflang: 'da', name: 'Dansk', direction: 'ltr' },
	{ code: 'no', hreflang: 'nb', name: 'Norsk', direction: 'ltr' },
	{ code: 'fi', hreflang: 'fi', name: 'Suomi', direction: 'ltr' },
	{ code: 'cs', hreflang: 'cs', name: 'Čeština', direction: 'ltr' },
	{ code: 'sk', hreflang: 'sk', name: 'Slovenčina', direction: 'ltr' },
	{ code: 'ro', hreflang: 'ro', name: 'Română', direction: 'ltr' },
	{ code: 'hu', hreflang: 'hu', name: 'Magyar', direction: 'ltr' },
	{ code: 'el', hreflang: 'el', name: 'Ελληνικά', direction: 'ltr' },
	{ code: 'bg', hreflang: 'bg', name: 'Български', direction: 'ltr' },
	{ code: 'hr', hreflang: 'hr', name: 'Hrvatski', direction: 'ltr' },
	{ code: 'sl', hreflang: 'sl', name: 'Slovenščina', direction: 'ltr' },
	{ code: 'bn', hreflang: 'bn', name: 'বাংলা', direction: 'ltr' },
	{ code: 'fa', hreflang: 'fa', name: 'فارسی', direction: 'rtl' },
	{ code: 'ur', hreflang: 'ur', name: 'اردو', direction: 'rtl' },
];

export type Locale = (typeof LOCALES)[number]['code'];

const LOCALE_CODES = new Set<string>(LOCALES.map(locale => locale.code));

export function isLocale(value: string | undefined): value is Locale {
	return value !== undefined && LOCALE_CODES.has(value);
}

export function getLocaleDefinition(code: string): LocaleDefinition {
	return LOCALES.find(locale => locale.code === code) ?? LOCALES[0];
}

export function localePrefix(locale: string): string {
	return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

export function stripLocale(pathname: string): string {
	const [, first] = pathname.split('/');
	if (first && first !== DEFAULT_LOCALE && isLocale(first)) {
		const rest = pathname.slice(first.length + 1);
		return rest === '' ? '/' : rest;
	}
	return pathname;
}

export function localizePath(path: string, locale: string): string {
	if (!path.startsWith('/')) return path;
	const prefix = localePrefix(locale);
	if (path === '/') return prefix === '' ? '/' : prefix;
	return `${prefix}${path}`;
}
