import { ScrollWords } from '@/components/motion/primitives';

export function Testimonials() {
	return (
		<section className="testimonials section">
			<span className="eyebrow">
				<i /> 04 / THE PARTNERSHIP STANDARD
			</span>
			<span className="quote-mark" aria-hidden="true">
				“
			</span>
			<blockquote>
				<ScrollWords
					text="It should feel like having the right people in your corner. Not another agency on your payroll."
					highlight={['corner']}
				/>
			</blockquote>
			<div className="quote-attribution">
				<span className="small-rule" />
				<p>
					The ROASWELL philosophy
					<span>Clear thinking. Close collaboration. Shared ambition.</span>
				</p>
			</div>
			<p className="testimonial-note">
				Client voices, in their own words, coming soon. We only publish verified testimonials.
			</p>
		</section>
	);
}
