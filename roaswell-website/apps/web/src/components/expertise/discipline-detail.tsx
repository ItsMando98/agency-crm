import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import type { Discipline } from '@/data/expertise';
import { disciplines } from '@/data/expertise';

export function DisciplineDetail({ discipline }: { discipline: Discipline }) {
	const others = disciplines.filter(d => d.slug !== discipline.slug);

	return (
		<>
			<section className="detail-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {discipline.eyebrow}
					</span>
					<Link to="/expertise" className="back-link">
						← All expertise
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
					<h4>CAPABILITIES</h4>
					<ul>
						{discipline.capabilities.map(c => (
							<li key={c}>{c}</li>
						))}
					</ul>
					<Link to="/contact" className="discipline-cta">
						Work with us <ArrowUpRight size={18} />
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

			<section className="related-disciplines section">
				<span className="eyebrow">
					<i /> THE OTHER DISCIPLINES
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
