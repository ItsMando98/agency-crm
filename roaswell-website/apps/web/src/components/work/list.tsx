import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { caseStudies } from '@/data/case-studies';

export function WorkList() {
	return (
		<section className="section">
			<div className="section-heading">
				<span className="eyebrow">02 / SELECTED WORK</span>
				<h2>
					Less noise.
					<br />
					More signal.
				</h2>
				<p>
					Commercial outcomes, not vanity metrics.
					<br />A look at how we think about performance.
				</p>
			</div>
			<div className="work-list">
				{caseStudies.map(c => (
					<Link to={`/work/${c.slug}`} className="work-card" key={c.slug}>
						<div className="wc-top">
							<span>{c.discipline.toUpperCase()}</span>
							<span>CASE STUDY</span>
						</div>
						<h3>{c.title}</h3>
						<p>{c.summary}</p>
						<div className="wc-metrics">
							{c.metrics.map(m => (
								<div key={m.label}>
									<strong>{m.value}</strong>
									<span>{m.label}</span>
								</div>
							))}
						</div>
						<span className="wc-cta">
							Read the study <ArrowUpRight size={18} />
						</span>
					</Link>
				))}
			</div>
			<p className="work-disclaimer">
				Illustrative campaign concepts and example targets — not verified client results.
				Client case studies are published with permission.
			</p>
		</section>
	);
}
