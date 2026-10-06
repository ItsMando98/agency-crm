import { ArrowUpRight } from 'lucide-react';
import type { Discipline } from '@/data/expertise';
import { Link, useT } from '@/i18n/context';

type DisciplineDetailProps = {
	discipline: Discipline;
	others: Discipline[];
};

export function DisciplineDetail({ discipline, others }: DisciplineDetailProps) {
	const t = useT();

	return (
		<>
			<section className="detail-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {discipline.eyebrow}
					</span>
					<Link to="/expertise" className="back-link">
						{t('expertise.back')}
					</Link>
				</div>
				<h1>
					{discipline.headline}
					<span>{discipline.headlineAccent}</span>
				</h1>
				<p className="detail-summary">{discipline.summary}</p>
			</section>

			<section className="detail-body">
				<aside className="detail-aside">
					<h4>{t('expertise.capabilities')}</h4>
					<ul>
						{discipline.capabilities.map(c => (
							<li key={c}>{c}</li>
						))}
					</ul>
					<Link to="/contact" className="discipline-cta">
						{t('expertise.workWithUs')} <ArrowUpRight size={18} />
					</Link>
				</aside>

				<div className="prose">
					{discipline.body.map((block, i) => {
						if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
						if (block.type === 'quote')
							return <blockquote key={i}>{block.text}</blockquote>;
						return <p key={i}>{block.text}</p>;
					})}
				</div>
			</section>

			{discipline.subpages.length > 0 && (
				<section className="specialisms section">
					<span className="eyebrow">
						<i /> {t('expertise.specialisms')}
					</span>
					<div className="related-grid">
						{discipline.subpages.map(subpage => (
							<Link to={`/expertise/${discipline.slug}/${subpage.slug}`} className="related-card" key={subpage.slug}>
								<span className="discipline-index">{subpage.eyebrow.split(' / ')[0]}</span>
								<h3>{subpage.name}</h3>
								<p>
									{subpage.headline} {subpage.headlineAccent}
								</p>
								<ArrowUpRight size={20} />
							</Link>
						))}
					</div>
				</section>
			)}

			<section className="related-disciplines section">
				<span className="eyebrow">
					<i /> {t('expertise.others')}
				</span>
				<div className="related-grid">
					{others.map(d => (
						<Link to={`/expertise/${d.slug}`} className="related-card" key={d.slug}>
							<span className="discipline-index">{d.number}</span>
							<h3>{d.name}</h3>
							<p>{d.headline} {d.headlineAccent}</p>
							<ArrowUpRight size={20} />
						</Link>
					))}
				</div>
			</section>
		</>
	);
}
