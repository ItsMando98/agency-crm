import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { disciplines } from '@/data/expertise';

export function ExpertiseDisciplines() {
	return (
		<div>
			{disciplines.map(d => (
				<section className="discipline-block" key={d.slug} id={d.slug}>
					<span className="discipline-index">{d.number}</span>
					<div>
						<h2 className="discipline-headline">
							{d.headline}
							<span>{d.headlineAccent}</span>
						</h2>
						<p className="discipline-summary">{d.summary}</p>
						<ul className="capability-list">
							{d.capabilities.map(c => (
								<li key={c}>{c}</li>
							))}
						</ul>
						<Link to={`/expertise/${d.slug}`} className="discipline-cta">
							{d.cta} <ArrowUpRight size={18} />
						</Link>
					</div>
				</section>
			))}
		</div>
	);
}
