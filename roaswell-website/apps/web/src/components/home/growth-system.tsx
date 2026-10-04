import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { disciplines } from '@/data/expertise';
import { EASE_OUT } from '@/components/motion/primitives';
import { LoopVideo } from '@/components/motion/loop-video';

const SCENES = [
	{ video: 'expertise-seo', caption: 'Climbing the results' },
	{ video: 'expertise-meta', caption: 'Testing to a clear winner' },
	{ video: 'expertise-google', caption: 'Intent converging on action' },
	{ video: 'expertise-motion', caption: 'Easing with intention' },
];

const COUNT_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'];

export function GrowthSystem() {
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
						<i /> 01 / OUR EXPERTISE
					</span>
					<h2 id="system-title">
						{COUNT_WORDS[count]} disciplines. <em>One growth system.</em>
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
								<div key={scene.video} className={index === active ? 'system-scene on' : 'system-scene'}>
									<LoopVideo
										name={scene.video}
										poster={`/${scene.video}-poster.jpg`}
										className="system-video"
										active={index === active}
										eager={index === 0}
									/>
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
									{SCENES[active].caption}
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
