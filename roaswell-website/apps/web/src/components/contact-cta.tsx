import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';

export function ContactCta() {
	return (
		<section className="cta-band section">
			<h2>
				Let’s talk
				<br />
				growth.
			</h2>
			<Link to="/contact" className="cta-band-link">
				Start a conversation <ArrowUpRight size={20} />
			</Link>
		</section>
	);
}
