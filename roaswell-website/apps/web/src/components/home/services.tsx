import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { services } from '@/data/studio';

const SLUGS = ['seo-content', 'meta-ads', 'google-ads'];

export function Services() {
	return (
		<section id="services" className="services section">
			<div className="section-heading">
				<span className="eyebrow">01 / OUR EXPERTISE</span>
				<h2>
					Three disciplines.
					<br />
					One growth mindset.
				</h2>
				<p>
					We don’t do everything.
					<br />
					We do the things that matter. Exceptionally well.
				</p>
			</div>
			<div className="service-list">
				{services.map((service, i) => (
					<Link to={`/expertise/${SLUGS[i]}`} className="service-row" key={service.number}>
						<span className="index">{service.number}</span>
						<h3>{service.name}</h3>
						<div>
							<p>{service.description}</p>
							<span className="micro">{service.tags}</span>
						</div>
						<ArrowUpRight className="row-arrow" size={29} />
					</Link>
				))}
			</div>
		</section>
	);
}
