import { DEFAULT_LOCALE, isLocale } from './locales';
import { mergeContent } from './merge';

type Messages = Record<string, string>;

const uiLoaders = import.meta.glob<{ default: Messages }>('./locales/*/ui.json');
const contentLoaders = import.meta.glob<{ default: unknown }>('./locales/*/content.json');
const legalLoaders = import.meta.glob<{ default: Messages }>('./locales/*/legal.json');

async function load<TValue>(
	loaders: Record<string, () => Promise<{ default: TValue }>>,
	locale: string,
	file: string,
): Promise<TValue | undefined> {
	if (!isLocale(locale)) return undefined;
	const loader = loaders[`./locales/${locale}/${file}.json`];
	return loader ? (await loader()).default : undefined;
}

export async function loadUiMessages(locale: string): Promise<Messages> {
	const english = (await load(uiLoaders, DEFAULT_LOCALE, 'ui')) ?? {};
	if (locale === DEFAULT_LOCALE) return english;
	return { ...english, ...(await load(uiLoaders, locale, 'ui')) };
}

export async function loadLegalMessages(locale: string): Promise<Messages> {
	const english = (await load(legalLoaders, DEFAULT_LOCALE, 'legal')) ?? {};
	if (locale === DEFAULT_LOCALE) return english;
	return { ...english, ...(await load(legalLoaders, locale, 'legal')) };
}

export async function localizeContent<TBase>(
	base: TBase,
	locale: string,
	section: 'expertise' | 'caseStudies' | 'articles',
): Promise<TBase> {
	if (locale === DEFAULT_LOCALE) return base;
	const overlay = (await load(contentLoaders, locale, 'content')) as Record<string, unknown> | undefined;
	return mergeContent(base, overlay?.[section]);
}
