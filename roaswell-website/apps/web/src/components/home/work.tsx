import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { caseStudies, type CaseStudy } from '@/data/case-studies';
import { Counter, EASE_OUT } from '@/components/motion/primitives';

const BARS = [18, 23, 22, 30, 38, 45, 41, 56, 62, 69, 77, 91];
const FUNNEL = [100, 72, 44, 23];

function CaseArt({ index }: { index: number }) {
	if (index === 0) {
		return (
			<div className="case-art bars" aria-hidden="true">
				{BARS.map((height, bar) => (
					<motion.i
						key={bar}
						style={{ height: `${height}%` }}
						initial={{ scaleY: 0 }}
						whileInView={{ scaleY: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 1.2, delay: bar * 0.06, ease: EASE_OUT }}
					/>
				))}
			</div>
		);
	}

	if (index === 1) {
		return (
			<svg className="case-art lines" viewBox="0 0 400 220" aria-hidden="true">
				<motion.path
					d="M10 40 C 90 46 150 90 210 120 S 330 180 390 196"
					className="line-down"
					initial={{ pathLength: 0 }}
					whileInView={{ pathLength: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 1.8, ease: EASE_OUT }}
				/>
				<motion.path
					d="M10 190 C 90 184 150 140 210 100 S 330 36 390 14"
					className="line-up"
					initial={{ pathLength: 0 }}
					whileInView={{ pathLength: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 1.8, delay: 0.25, ease: EASE_OUT }}
				/>
				<text x="14" y="30">COST</text>
				<text x="14" y="212">RETURN</text>
			</svg>
		);
	}

	return (
		<div className="case-art funnel" aria-hidden="true">
			{FUNNEL.map((width, step) => (
				<motion.i
					key={step}
					style={{ width: `${width}%` }}
					initial={{ scaleX: 0 }}
					whileInView={{ scaleX: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 1.1, delay: step * 0.18, ease: EASE_OUT }}
				/>
			))}
		</div>
	);
}

function parseMetric(value: string) {
	const match = value.match(/^([+−-]?)(\d+(?:\.\d+)?)(.*)$/);
	if (!match) return { prefix: '', to: 0, decimals: 0, suffix: value };
	const [, prefix, digits, suffix] = match;
	return {
		prefix,
		to: Number(digits),
		decimals: digits.includes('.') ? digits.split('.')[1].length : 0,
		suffix,
	};
}

function CasePanel({ study, index }: { study: CaseStudy; index: number }) {
	return (
		<Link to={`/work/${study.slug}`} className="case-panel">
			<div className="case-top">
				<span>{study.discipline.toUpperCase()}</span>
				<span>0{index + 1} / ILLUSTRATIVE STUDY</span>
			</div>
			<CaseArt index={index} />
			<h3>{study.title}</h3>
			<p>{study.summary}</p>
			<div className="case-metrics">
				{study.metrics.map(metric => {
					const parsed = parseMetric(metric.value);
					return (
						<div key={metric.label}>
							<strong>
								<Counter {...parsed} duration={1.8} />
							</strong>
							<span>{metric.label}</span>
						</div>
					);
				})}
			</div>
			<span className="case-cta">
				Read the study <ArrowUpRight size={18} />
			</span>
		</Link>
	);
}

export function Work() {
	const ref = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const reduced = useReducedMotion();
	const [distance, setDistance] = useState(0);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
	const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
	const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;
		const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(track);
		window.addEventListener('resize', measure);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', measure);
		};
	}, []);

	return (
		<section
			ref={ref}
			className="work"
			id="work"
			aria-labelledby="work-title"
			style={{ height: `calc(100svh + ${distance}px)` }}
		>
			<div className="work-sticky">
				<motion.div ref={trackRef} className="work-track" style={{ x: reduced ? 0 : x }}>
					<div className="work-intro">
						<span className="eyebrow">
							<i /> 02 / THE WORK
						</span>
						<h2 id="work-title">
							Less noise.
							<br />
							<em>More signal.</em>
						</h2>
						<p>
							Commercial outcomes, not vanity metrics. A look at how we think about performance.
						</p>
						<span className="work-hint">KEEP SCROLLING &rarr;</span>
						<p className="work-disclaimer">
							Illustrative campaign concepts and example targets, not verified client results. Client case studies
							are published with permission.
						</p>
					</div>
					{caseStudies.map((study, index) => (
						<CasePanel key={study.slug} study={study} index={index} />
					))}
					<div className="work-outro">
						<h3>
							Your brand
							<br />
							<span>is next.</span>
						</h3>
						<Link to="/contact" className="button primary">
							Start a conversation <ArrowUpRight size={19} />
						</Link>
						<Link to="/work" className="discipline-cta">
							All studies <ArrowUpRight size={18} />
						</Link>
					</div>
				</motion.div>
				<div className="work-rail" aria-hidden="true">
					<motion.i style={{ width: fill }} />
				</div>
			</div>
		</section>
	);
}
