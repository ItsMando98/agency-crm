import { ArrowUpRight } from 'lucide-react';
import type { CaseStudy } from '@/data/case-studies';
import { Link, Lines, useLocale, useT } from '@/i18n/context';

type WorkListProps = {
	caseStudies: CaseStudy[];
};

export function WorkList({ caseStudies }: WorkListProps) {
	const t = useT();
	const locale = useLocale();

	return (
		<section className="section">
			<div className="section-heading">
				<span className="eyebrow">{t('work.list.eyebrow')}</span>
				<h2>
					{t('work.title')}
					<br />
					{t('work.titleAccent')}
				</h2>
				<p>
					<Lines text={t('work.list.lede')} />
				</p>
			</div>
			<div className="work-list">
				{caseStudies.map(study => (
					<Link to={`/work/${study.slug}`} className="work-card" key={study.slug}>
						<div className="wc-top">
							<span>{study.discipline.toLocaleUpperCase(locale)}</span>
							<span>{t(study.illustrative ? 'work.illustrativeLabel' : 'work.caseStudyLabel')}</span>
						</div>
						<h3>{study.title}</h3>
						<p>{study.summary}</p>
						<div className="wc-metrics">
							{study.metrics.map(metric => (
								<div key={metric.label}>
									<strong>{metric.value}</strong>
									<span>{metric.label}</span>
								</div>
							))}
						</div>
						<span className="wc-cta">
							{t('work.read')} <ArrowUpRight size={18} />
						</span>
					</Link>
				))}
			</div>
			{caseStudies.some(study => study.illustrative) && (
				<p className="work-disclaimer">{t('work.disclaimer')}</p>
			)}
		</section>
	);
}
