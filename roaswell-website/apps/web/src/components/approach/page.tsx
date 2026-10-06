import { ArrowUpRight } from 'lucide-react';
import { APPROACH_STEPS } from '@/data/studio';
import { Link, Lines, useT } from '@/i18n/context';

export function ApproachPage() {
	const t = useT();

	return (
		<>
			<section className="page-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {t('approach.home.eyebrow')}
					</span>
					<span className="hero-note">{t('approach.sign')}</span>
				</div>
				<h1>
					{t('approach.line1')}
					<br />
					{t('approach.line2')}
					<br />
					<em>{t('approach.line3')}</em>
				</h1>
				<p>{t('approach.page.lede')}</p>
			</section>

			<section className="approach section">
				<div className="approach-intro">
					<span className="eyebrow">{t('approach.page.eyebrow')}</span>
					<h2>
						<Lines text={t('approach.page.title')} />
					</h2>
					<p>{t('approach.page.text')}</p>
					<span className="approach-sign">{t('approach.page.sign')}</span>
				</div>
				<div className="approach-steps">
					{APPROACH_STEPS.map(item => (
						<article key={item.number}>
							<span className="large-index">{item.number}</span>
							<div>
								<h3>{t(item.titleKey)}</h3>
								<p>{t(item.textKey)}</p>
							</div>
						</article>
					))}
					<div className="principle">
						<span className="status-dot" /> {t('approach.principle')}
					</div>
				</div>
			</section>

			<section className="section">
				<div className="section-heading">
					<span className="eyebrow">{t('approach.studio.eyebrow')}</span>
					<h2>{t('approach.studio.title')}</h2>
					<p>{t('approach.studio.lede')}</p>
				</div>
				<p className="prose">{t('approach.studio.text')}</p>
				<p className="prose" style={{ marginTop: 18 }}>
					<Link to="/about" className="discipline-cta">
						{t('approach.studio.more')} <ArrowUpRight size={18} />
					</Link>
				</p>
			</section>
		</>
	);
}
