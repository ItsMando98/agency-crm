import { createContext, Fragment, useContext, useMemo, type ReactNode } from 'react';
import { Link as RouterLink, useLocation, type LinkProps } from 'react-router';
import type en from './locales/en/ui.json';
import { getLocaleDefinition, localizePath, stripLocale } from './locales';

export type MessageKey = keyof typeof en;

type Messages = Record<string, string>;

type I18nValue = {
	locale: string;
	direction: 'ltr' | 'rtl';
	messages: Messages;
};

const I18nContext = createContext<I18nValue>({ locale: 'en', direction: 'ltr', messages: {} });

type I18nProviderProps = {
	locale: string;
	messages: Messages;
	children: ReactNode;
};

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
	const value = useMemo(
		() => ({ locale, direction: getLocaleDefinition(locale).direction, messages }),
		[locale, messages],
	);
	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export type Translate = (key: MessageKey, variables?: Record<string, string | number>) => string;

export function interpolate(template: string, variables?: Record<string, string | number>): string {
	if (!variables) return template;
	return template.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in variables ? String(variables[name]) : match,
	);
}

export function createTranslator(messages: Messages): Translate {
	return (key, variables) => interpolate(messages[key] ?? key, variables);
}

export function useI18n() {
	return useContext(I18nContext);
}

export function useLocale() {
	return useContext(I18nContext).locale;
}

export function useT(): Translate {
	const { messages } = useContext(I18nContext);
	return useMemo(() => createTranslator(messages), [messages]);
}

export function useLocalizedPath() {
	const { locale } = useContext(I18nContext);
	return (path: string) => localizePath(path, locale);
}

export function usePathInLocale() {
	const { pathname, search } = useLocation();
	const bare = stripLocale(pathname);
	return (target: string) => `${localizePath(bare, target)}${search}`;
}

export function Link({ to, ...props }: LinkProps) {
	const { locale } = useContext(I18nContext);
	const resolved = typeof to === 'string' ? localizePath(to, locale) : to;
	return <RouterLink to={resolved} {...props} />;
}

type LinesProps = { text: string };

export function Lines({ text }: LinesProps) {
	const parts = text.split('\n');
	return (
		<>
			{parts.map((part, index) => (
				<Fragment key={index}>
					{index > 0 && <br />}
					{part}
				</Fragment>
			))}
		</>
	);
}
