import { ArrowUpRight } from 'lucide-react';
import { Link, Lines, useT } from '@/i18n/context';
import { usePrimaryCta } from '@/lib/use-root-data';

export function ContactCta() {
	const t = useT();
	const cta = usePrimaryCta();

	return (
		<section className="cta-band section">
			<h2>
				<Lines text={t('cta.band.title')} />
			</h2>
			{cta.external ? (
				<a href={cta.href} className="cta-band-link" target="_blank" rel="noopener noreferrer">
					{t(cta.labelKey)} <ArrowUpRight size={20} />
				</a>
			) : (
				<Link to={cta.href} className="cta-band-link">
					{t(cta.labelKey)} <ArrowUpRight size={20} />
				</Link>
			)}
		</section>
	);
}
