import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="footer-top">
				<p className="footer-tagline">
					Marketing
					<br />
					done well.
				</p>
				<nav className="footer-links" aria-label="Footer navigation">
					<Link to="/expertise">Expertise</Link>
					<Link to="/work">Work</Link>
					<Link to="/approach">Approach</Link>
					<Link to="/insights">Insights</Link>
					<Link to="/about">About</Link>
					<Link to="/contact">Contact</Link>
					<a href="https://client.roaswell.com" target="_blank" rel="noopener noreferrer">
						Client Portal <ArrowUpRight size={14} />
					</a>
				</nav>
			</div>
			<div className="footer-wordmark" aria-hidden="true">
				ROASWELL
			</div>
			<div className="footer-bottom">
				<span>© 2026 ROASWELL</span>
				<a href="mailto:hello@roaswell.com">hello@roaswell.com</a>
			</div>
		</footer>
	);
}
