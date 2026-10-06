import { createTranslator, type Translate } from '@/i18n/context';
import { DEFAULT_LOCALE, LOCALES, localizePath, stripLocale } from '@/i18n/locales';

type Match = { id?: string; loaderData?: unknown } | undefined;

type SeoContext = { matches: Match[]; location: { pathname: string } };

type SeoOptions = {
	title: string;
	description: string;
	type?: 'website' | 'article';
	image?: string;
	noindex?: boolean;
	jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

type RootData = {
	origin?: string;
	locale?: string;
	messages?: Record<string, string>;
};

function rootDataFrom(matches: Match[]): RootData {
	const root = matches.find(m => m?.id === 'root');
	return (root?.loaderData as RootData | undefined) ?? {};
}

export function siteOriginFrom(matches: Match[]): string {
	return rootDataFrom(matches).origin ?? '';
}

export function localeFrom(matches: Match[]): string {
	return rootDataFrom(matches).locale ?? DEFAULT_LOCALE;
}

export function translatorFrom(matches: Match[]): Translate {
	return createTranslator(rootDataFrom(matches).messages ?? {});
}

export function metaContext(matches: Match[]) {
	return {
		origin: siteOriginFrom(matches),
		locale: localeFrom(matches),
		t: translatorFrom(matches),
	};
}

export function absoluteUrl(origin: string, pathname: string): string {
	return `${origin}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export function seo({ matches, location }: SeoContext, options: SeoOptions) {
	const origin = siteOriginFrom(matches);
	const locale = localeFrom(matches);
	const url = absoluteUrl(origin, location.pathname);
	const imageUrl = absoluteUrl(origin, options.image || '/og-image.png');
	const barePath = stripLocale(location.pathname);

	const tags: Array<Record<string, unknown>> = [
		{ title: options.title },
		{ name: 'description', content: options.description },
		{ tagName: 'link', rel: 'canonical', href: url },

		// OpenGraph
		{ property: 'og:site_name', content: 'ROASWELL' },
		{ property: 'og:title', content: options.title },
		{ property: 'og:description', content: options.description },
		{ property: 'og:type', content: options.type ?? 'website' },
		{ property: 'og:url', content: url },
		{ property: 'og:locale', content: locale.replace('-', '_') },
		{ property: 'og:image', content: imageUrl },
		{ property: 'og:image:width', content: '1200' },
		{ property: 'og:image:height', content: '630' },
		{ property: 'og:image:alt', content: options.title },

		// Twitter Cards
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: options.title },
		{ name: 'twitter:description', content: options.description },
		{ name: 'twitter:image', content: imageUrl },
	];

	if (!options.noindex) {
		for (const alternate of LOCALES) {
			tags.push({
				tagName: 'link',
				rel: 'alternate',
				hrefLang: alternate.hreflang,
				href: absoluteUrl(origin, localizePath(barePath, alternate.code)),
			});
		}
		tags.push({
			tagName: 'link',
			rel: 'alternate',
			hrefLang: 'x-default',
			href: absoluteUrl(origin, localizePath(barePath, DEFAULT_LOCALE)),
		});
	}

	if (options.noindex) {
		tags.push({ name: 'robots', content: 'noindex, nofollow' });
	}

	if (options.jsonLd) {
		if (Array.isArray(options.jsonLd)) {
			options.jsonLd.forEach(schema => {
				tags.push({ 'script:ld+json': schema });
			});
		} else {
			tags.push({ 'script:ld+json': options.jsonLd });
		}
	}

	return tags;
}
