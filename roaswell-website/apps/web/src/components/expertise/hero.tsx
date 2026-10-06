import { Lines, useT } from '@/i18n/context';

export function ExpertiseHero() {
	const t = useT();

	return (
		<section className="page-hero">
			<div className="hero-top">
				<span className="eyebrow">
					<i /> {t('expertise.eyebrow')}
				</span>
				<span className="hero-note">{t('expertise.note')}</span>
			</div>
			<h1>
				<Lines text={t('expertise.title')} />
			</h1>
			<p>
				<Lines text={t('expertise.lede')} />
			</p>
		</section>
	);
}
