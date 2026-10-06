import { ArrowUpRight } from 'lucide-react';
import type { CaseStudy } from '@/data/case-studies';
import { Link, useLocale, useT } from '@/i18n/context';

export function CaseStudyView({ study }: { study: CaseStudy }) {
	const t = useT();
	const locale = useLocale();

	return (
		<>
			<section className="detail-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {study.discipline.toLocaleUpperCase(locale)}
					</span>
					<Link to="/work" className="back-link">
						{t('work.back')}
					</Link>
				</div>
				<h1>{study.title}</h1>
				<p className="detail-summary">{study.summary}</p>
			</section>

			<section className="detail-body">
				<aside className="detail-aside">
					<h4>{t('work.results')}</h4>
					<ul>
						{study.metrics.map(metric => (
							<li key={metric.label}>
								<strong>{metric.value}</strong> — {metric.label}
							</li>
						))}
					</ul>
				</aside>

				<div className="prose">
					<h2>{t('work.challenge')}</h2>
					<p>{study.challenge}</p>
					<h2>{t('work.approach')}</h2>
					<p>{study.approach}</p>
					<h2>{t('work.outcome')}</h2>
					<p>{study.outcome}</p>
					{study.illustrative && <blockquote>{t('work.studyNote')}</blockquote>}
				</div>
			</section>

			<section className="section">
				<Link to="/contact" className="discipline-cta">
					{t('work.similar')} <ArrowUpRight size={18} />
				</Link>
			</section>
		</>
	);
}
