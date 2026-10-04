import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';

export function AboutPage() {
	return (
		<>
			<section className="page-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> ABOUT ROASWELL
					</span>
					<span className="hero-note">Marketing done well.</span>
				</div>
				<h1>
					Independent
					<br />
					by design.
				</h1>
				<p>
					ROASWELL is an independent digital growth studio. We work in four disciplines —
					SEO & Content, Meta Ads, Google Ads and Motion Graphics — because they belong together, and
					because keeping them under one roof is how growth actually compounds.
				</p>
			</section>

			<section className="section">
				<div className="about-grid">
					<div>
						<span className="eyebrow">
							<i /> THE POINT OF VIEW
						</span>
						<h2 style={{ marginTop: 24 }}>
							Less agency.
							<br />
							More impact.
						</h2>
					</div>
					<div className="prose">
						<p>
							ROASWELL was founded on a simple frustration: growth work that looked busy
							but moved nothing. Reports were long, dashboards were flattering, and the
							business was no further forward.
						</p>
						<p>
							We built the studio around the opposite. Fewer clients, senior attention,
							and a measurement standard that keeps the numbers honest. The person who
							shapes your strategy is the one who executes it.
						</p>
						<p>
							We don’t do everything. We do the things that matter — search, content, and
							paid media — exceptionally well, and we treat them as one system rather than
							three separate invoices.
						</p>
						<dl className="about-facts">
							<dt>STUDIO</dt>
							<dd>Independent, senior-led</dd>
							<dt>DISCIPLINES</dt>
							<dd>SEO & Content · Meta Ads · Google Ads · Motion Graphics</dd>
							<dt>STANDARD</dt>
							<dd>Transparent reporting tied to commercial outcomes</dd>
							<dt>CONTACT</dt>
							<dd>
								<Link to="/contact">hello@roaswell.com</Link>
							</dd>
						</dl>
					</div>
				</div>
			</section>

			<section className="section" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
				<div className="section-heading" style={{ marginBottom: 30 }}>
					<span className="eyebrow" style={{ color: '#b6b4ac' }}>
						<i /> START HERE
					</span>
					<h2 style={{ color: 'var(--paper)' }}>Where to next.</h2>
				</div>
				<div className="related-grid">
					<Link to="/expertise" className="related-card dark">
						<h3>Expertise</h3>
						<p>Four disciplines, one system.</p>
						<ArrowUpRight size={20} />
					</Link>
					<Link to="/approach" className="related-card dark">
						<h3>Approach</h3>
						<p>How the studio works.</p>
						<ArrowUpRight size={20} />
					</Link>
					<Link to="/contact" className="related-card dark">
						<h3>Contact</h3>
						<p>Start a conversation.</p>
						<ArrowUpRight size={20} />
					</Link>
				</div>
			</section>
		</>
	);
}
