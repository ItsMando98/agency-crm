import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { Link, useT } from '@/i18n/context';
import { LanguageSwitcher } from '@/components/language-switcher';

const NAV = [
	{ key: 'nav.expertise', to: '/expertise' },
	{ key: 'nav.work', to: '/work' },
	{ key: 'nav.approach', to: '/approach' },
	{ key: 'nav.insights', to: '/insights' },
] as const;

export function SiteHeader() {
	const t = useT();
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
			<nav className={open ? 'nav open' : 'nav'} aria-label={t('nav.main')}>
				{NAV.map(item => (
					<Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
						{t(item.key)}
					</Link>
				))}
				<Link className="nav-contact" to="/contact" onClick={() => setOpen(false)}>
					{t('cta.talkShort')} <ArrowUpRight size={16} />
				</Link>
				<LanguageSwitcher />
			</nav>
			<button
				className="menu-button"
				aria-label={open ? t('nav.close') : t('nav.open')}
				aria-expanded={open}
				onClick={() => setOpen(!open)}
			>
				{open ? <X /> : <Menu />}
			</button>
			<motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
		</header>
	);
}
