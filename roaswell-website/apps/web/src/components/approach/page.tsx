import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { approach } from '@/data/studio';

export function ApproachPage() {
	return (
		<>
			<section className="page-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> 03 / THE ROASWELL APPROACH
					</span>
					<span className="hero-note">Independent in spirit. Accountable by nature.</span>
				</div>
				<h1>
					Big thinking.
					<br />
					Small team.
					<br />
					<em>Better work.</em>
				</h1>
				<p>
					You work directly with the people doing the thinking — and the doing.
					No layers. No handoffs. No mystery about where your investment goes.
				</p>
			</section>

			<section className="approach section">
				<div className="approach-intro">
					<span className="eyebrow">HOW WE WORK</span>
					<h2>
						Senior-led.
						<br />
						Specialist-delivered.
					</h2>
					<p>
						ROASWELL is deliberately small. The person who shapes your strategy is the
						one who executes it — so thinking stays sharp and accountability stays close.
					</p>
					<span className="approach-sign">No junior handoffs. No agency bloat.</span>
				</div>
				<div className="approach-steps">
					{approach.map(item => (
						<article key={item.number}>
							<span className="large-index">{item.number}</span>
							<div>
								<h3>{item.title}</h3>
								<p>{item.text}</p>
							</div>
						</article>
					))}
					<div className="principle">
						<span className="status-dot" /> SENIOR-LED. SPECIALIST-DELIVERED. ALWAYS ACCOUNTABLE.
					</div>
				</div>
			</section>

			<section className="section">
				<div className="section-heading">
					<span className="eyebrow">THE STUDIO</span>
					<h2>Who’s behind the work.</h2>
					<p>A short note on the people and the point of view.</p>
				</div>
				<p className="prose">
					ROASWELL was founded on a simple frustration: growth work that looked busy but
					moved nothing. We built a studio around the opposite — fewer clients, senior
					attention, and a measurement standard that keeps the numbers honest.
				</p>
				<p className="prose" style={{ marginTop: 18 }}>
					<Link to="/about" className="discipline-cta">
						More about the studio <ArrowUpRight size={18} />
					</Link>
				</p>
			</section>
		</>
	);
}
