import { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { LOCALES, getLocaleDefinition } from '@/i18n/locales';
import { useI18n, usePathInLocale, useT } from '@/i18n/context';

type LanguageSwitcherProps = {
	variant?: 'menu' | 'list';
};

export function LanguageSwitcher({ variant = 'menu' }: LanguageSwitcherProps) {
	const t = useT();
	const { locale } = useI18n();
	const pathIn = usePathInLocale();
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onPointerDown = (event: PointerEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open]);

	const links = (
		<ul className="language-list">
			{LOCALES.map(item => (
				<li key={item.code}>
					<a
						href={pathIn(item.code)}
						lang={item.hreflang}
						hrefLang={item.hreflang}
						dir={item.direction}
						aria-current={item.code === locale ? 'true' : undefined}
						onClick={() => setOpen(false)}
					>
						<span>{item.name}</span>
						{item.code === locale && <Check size={14} aria-hidden="true" />}
					</a>
				</li>
			))}
		</ul>
	);

	if (variant === 'list') {
		return (
			<nav className="language-switcher is-list" aria-label={t('language.label')}>
				{links}
			</nav>
		);
	}

	return (
		<div className="language-switcher" ref={containerRef}>
			<button
				type="button"
				className="language-trigger"
				aria-expanded={open}
				aria-haspopup="true"
				aria-label={t('language.label')}
				onClick={() => setOpen(!open)}
			>
				<Globe size={16} aria-hidden="true" />
				<span>{getLocaleDefinition(locale).hreflang.split('-')[0].toUpperCase()}</span>
			</button>
			{open && <div className="language-panel">{links}</div>}
		</div>
	);
}
