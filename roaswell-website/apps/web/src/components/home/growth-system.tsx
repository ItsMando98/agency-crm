import { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { Discipline } from '@/data/expertise';
import { Link, useT } from '@/i18n/context';
import { EASE_OUT } from '@/components/motion/primitives';
import { SceneCanvas } from '@/components/motion/scene-canvas';
import { seoScene } from '@/lib/scenes/seo';
import { metaScene } from '@/lib/scenes/meta';
import { googleScene } from '@/lib/scenes/google';
import { motionScene } from '@/lib/scenes/motion';

const SCENES = [
	{ scene: seoScene, captionKey: 'system.caption.seo' },
	{ scene: metaScene, captionKey: 'system.caption.meta' },
	{ scene: googleScene, captionKey: 'system.caption.google' },
	{ scene: motionScene, captionKey: 'system.caption.motion' },
] as const;

type GrowthSystemProps = {
	disciplines: Discipline[];
};

export function GrowthSystem({ disciplines }: GrowthSystemProps) {
	const t = useT();
	const ref = useRef<HTMLElement>(null);
	const reduced = useReducedMotion();
	const [active, setActive] = useState(0);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
	const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
	const count = disciplines.length;

	useMotionValueEvent(scrollYProgress, 'change', value => {
		setActive(Math.min(count - 1, Math.max(0, Math.floor(value * count))));
	});

	function goTo(index: number) {
		const section = ref.current;
		if (!section) return;
		const travel = section.offsetHeight - window.innerHeight;
		const top = section.offsetTop + (travel * (index + 0.5)) / count;
		window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
	}

	return (
		<section ref={ref} className="system" id="services" aria-labelledby="system-title">
			<div className="system-sticky">
				<div className="system-head">
					<span className="eyebrow">
						<i /> {t('system.eyebrow')}
					</span>
					<h2 id="system-title">
						{t('system.title')} <em>{t('system.titleAccent')}</em>
					</h2>
				</div>

				<div className="system-body">
					<ol className="system-list">
						{disciplines.map((discipline, index) => {
							const on = index === active;
							return (
								<li key={discipline.slug} className={on ? 'on' : ''}>
									<button type="button" onClick={() => goTo(index)} aria-current={on ? 'true' : undefined}>
										<span className="sys-number">{discipline.number}</span>
										<span className="sys-name">{discipline.name}</span>
									</button>
									<AnimatePresence initial={false}>
										{on && (
											<motion.div
												className="sys-detail"
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: 'auto', opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.55, ease: EASE_OUT }}
											>
												<p>{discipline.summary}</p>
												<ul className="capability-list">
													{discipline.capabilities.slice(0, 4).map(item => (
														<li key={item}>{item}</li>
													))}
												</ul>
												<Link to={`/expertise/${discipline.slug}`} className="discipline-cta">
													{discipline.cta} <ArrowUpRight size={18} />
												</Link>
											</motion.div>
										)}
									</AnimatePresence>
								</li>
							);
						})}
					</ol>

					<div className="system-media">
						<div className="system-frame">
							{SCENES.map((scene, index) => (
								<div key={scene.captionKey} className={index === active ? 'system-scene on' : 'system-scene'}>
									<SceneCanvas scene={scene.scene} className="system-video" active={index === active} />
								</div>
							))}
							<span className="system-count">
								0{active + 1} <b>/ 0{count}</b>
							</span>
							<AnimatePresence mode="wait">
								<motion.span
									key={active}
									className="system-caption"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.35 }}
								>
									{t(SCENES[active].captionKey)}
								</motion.span>
							</AnimatePresence>
						</div>
					</div>
				</div>

				<div className="system-progress" aria-hidden="true">
					<motion.i style={{ width: fill }} />
				</div>
			</div>

			<ul className="sr-only">
				{disciplines.map(discipline => (
					<li key={discipline.slug}>
						<Link to={`/expertise/${discipline.slug}`}>{discipline.name}</Link>: {discipline.summary}
					</li>
				))}
			</ul>
		</section>
	);
}
