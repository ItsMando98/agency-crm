import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';

const NAV = [
	{ label: 'Expertise', to: '/expertise' },
	{ label: 'Work', to: '/work' },
	{ label: 'Approach', to: '/approach' },
	{ label: 'Insights', to: '/insights' },
];

export function SiteHeader() {
	const [open, setOpen] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { scrollY, scrollYProgress } = useScroll();
	const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

	useMotionValueEvent(scrollY, 'change', latest => {
		const previous = scrollY.getPrevious() ?? 0;
		setScrolled(latest > 40);
		setHidden(latest > previous && latest > 240 && !open);
	});

	const className = ['site-header', scrolled ? 'is-scrolled' : '', hidden ? 'is-hidden' : '']
		.filter(Boolean)
		.join(' ');

	return (
		<header className={className}>
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
			<motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
		</header>
	);
}
