import { ScrollWords } from '@/components/motion/primitives';
import { testimonials } from '@/data/proof';
import { useT } from '@/i18n/context';

export function Testimonials() {
	const t = useT();

	return (
		<section className="testimonials section">
			<span className="eyebrow">
				<i /> {t('testimonials.eyebrow')}
			</span>
			<span className="quote-mark" aria-hidden="true">
				“
			</span>
			<blockquote>
				<ScrollWords text={t('testimonials.quote')} />
			</blockquote>
			<div className="quote-attribution">
				<span className="small-rule" />
				<p>
					{t('testimonials.philosophy')}
					<span>{t('testimonials.philosophyLine')}</span>
				</p>
			</div>
			{testimonials.length > 0 ? (
				<div className="client-quotes">
					{testimonials.map(item => (
						<figure key={item.author} className="client-quote">
							<blockquote>{item.quote}</blockquote>
							<figcaption>
								{item.author}
								<span>
									{item.role}, {item.company}
								</span>
							</figcaption>
						</figure>
					))}
				</div>
			) : (
				<p className="testimonial-note">{t('testimonials.note')}</p>
			)}
		</section>
	);
}
