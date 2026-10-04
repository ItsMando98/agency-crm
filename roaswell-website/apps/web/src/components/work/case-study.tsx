import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import type { CaseStudy } from '@/data/case-studies';

export function CaseStudyView({ study }: { study: CaseStudy }) {
	return (
		<>
			<section className="detail-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {study.discipline.toUpperCase()}
					</span>
					<Link to="/work" className="back-link">
						← All work
					</Link>
				</div>
				<h1>{study.title}</h1>
				<p className="detail-summary">{study.summary}</p>
			</section>

			<section className="detail-body">
				<aside className="detail-aside">
					<h4>RESULTS</h4>
					<ul>
						{study.metrics.map(m => (
							<li key={m.label}>
								<strong>{m.value}</strong> — {m.label}
							</li>
						))}
					</ul>
				</aside>

				<div className="prose">
					<h2>The challenge</h2>
					<p>{study.challenge}</p>
					<h2>Our approach</h2>
					<p>{study.approach}</p>
					<h2>The outcome</h2>
					<p>{study.outcome}</p>
					<blockquote>
						Illustrative strategy study — example targets, not verified client results.
					</blockquote>
				</div>
			</section>

			<section className="section">
				<Link to="/contact" className="discipline-cta">
					Have a similar challenge? Let’s talk <ArrowUpRight size={18} />
				</Link>
			</section>
		</>
	);
}
