import { disciplines, type Discipline } from '@/data/expertise';
import { caseStudies } from '@/data/case-studies';
import { articles } from '@/data/articles';
import { DEFAULT_LOCALE } from '@/i18n/locales';
import { localizeContent } from '@/i18n/messages.server';

export function localeFromParams(params: { lang?: string }): string {
	return params.lang ?? DEFAULT_LOCALE;
}

export function getDisciplines(locale: string) {
	return localizeContent(disciplines, locale, 'expertise');
}

export function getCaseStudies(locale: string) {
	return localizeContent(caseStudies, locale, 'caseStudies');
}

export function getArticles(locale: string) {
	return localizeContent(articles, locale, 'articles');
}

export function findSubpage(list: Discipline[], disciplineSlug: string, subpageSlug: string) {
	const discipline = list.find(item => item.slug === disciplineSlug);
	const subpage = discipline?.subpages.find(item => item.slug === subpageSlug);
	return discipline && subpage ? { discipline, subpage } : undefined;
}
