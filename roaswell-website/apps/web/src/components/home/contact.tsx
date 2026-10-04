import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { Magnetic, MaskedLines } from '@/components/motion/primitives';

export function Contact() {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
	const radius = useTransform(scrollYProgress, [0, 1], [0, 150]);
	const clip = useMotionTemplate`circle(${radius}% at 50% 100%)`;

	return (
		<section ref={ref} id="contact" className="contact section">
			<motion.div className="contact-wash" style={{ clipPath: clip }} aria-hidden="true" />
			<div className="contact-inner">
				<div className="contact-top">
					<span className="eyebrow">
						<i /> 05 / WHAT’S NEXT?
					</span>
					<span>A better return starts with a better conversation.</span>
				</div>
				<h2 className="contact-title">
					<MaskedLines lines={['LET’S TALK', <span key="growth" className="contact-accent">GROWTH.</span>]} />
				</h2>
				<div className="contact-bottom">
					<p>
						Tell us where you are.
						<br />
						Let’s work out where you could go.
					</p>
					<Magnetic>
						<Link className="button light" to="/contact">
							Start a conversation <ArrowUpRight size={19} />
						</Link>
					</Magnetic>
					<a className="contact-email" href="mailto:hello@roaswell.com?subject=Let%E2%80%99s%20talk%20growth">
						hello@roaswell.com <ArrowUpRight size={19} />
					</a>
				</div>
			</div>
		</section>
	);
}
