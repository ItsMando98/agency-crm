import { Link } from 'react-router';

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<Link className="wordmark" to="/">
				ROASWELL<span>®</span>
			</Link>
			<p>Marketing done well.</p>
			<div>
				<Link to="/expertise">Expertise</Link>
				<Link to="/work">Work</Link>
				<Link to="/insights">Insights</Link>
				<Link to="/about">About</Link>
				<Link to="/contact">Contact</Link>
				<a href="https://client.roaswell.com" target="_blank" rel="noopener noreferrer">Client Portal</a>
				<span>© 2026 ROASWELL</span>
			</div>
		</footer>
	);
}
