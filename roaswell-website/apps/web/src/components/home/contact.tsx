import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { Magnetic, MaskedLines } from '@/components/motion/primitives';
import { Link, useT } from '@/i18n/context';
import { usePrimaryCta } from '@/lib/use-root-data';

export function Contact() {
	const t = useT();
	const cta = usePrimaryCta();
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
						<i /> {t('contact.home.eyebrow')}
					</span>
					<span>{t('contact.note')}</span>
				</div>
				<h2 className="contact-title">
					<MaskedLines lines={[t('contact.home.line1'), <span key="growth" className="contact-accent">{t('contact.home.line2')}</span>]} />
				</h2>
				<div className="contact-bottom">
					<p>
						{t('contact.home.lede')}
					</p>
					<Magnetic>
						{cta.external ? (
							<a className="button light" href={cta.href} target="_blank" rel="noopener noreferrer">
								{t(cta.labelKey)} <ArrowUpRight size={19} />
							</a>
						) : (
							<Link className="button light" to={cta.href}>
								{t(cta.labelKey)} <ArrowUpRight size={19} />
							</Link>
						)}
					</Magnetic>
					<a className="contact-email" href={`mailto:hello@roaswell.com?subject=${encodeURIComponent(t('contact.mailSubject'))}`}>
						hello@roaswell.com <ArrowUpRight size={19} />
					</a>
				</div>
			</div>
		</section>
	);
}
