import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const NAV = [
	{ label: 'Expertise', to: '/expertise' },
	{ label: 'Work', to: '/work' },
	{ label: 'Approach', to: '/approach' },
	{ label: 'Insights', to: '/insights' },
];

export function SiteHeader() {
	const [open, setOpen] = useState(false);
	return (
		<header className="site-header">
			<Link className="wordmark" to="/" onClick={() => setOpen(false)}>
				ROASWELL<span>®</span>
			</Link>
			<nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
				{NAV.map(item => (
					<Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
						{item.label}
					</Link>
				))}
				<Link className="nav-contact" to="/contact" onClick={() => setOpen(false)}>
					Let’s talk <ArrowUpRight size={16} />
				</Link>
			</nav>
			<button
				className="menu-button"
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				onClick={() => setOpen(!open)}
			>
				{open ? <X /> : <Menu />}
			</button>
		</header>
	);
}
