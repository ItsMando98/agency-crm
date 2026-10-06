import { ArrowUpRight } from 'lucide-react';
import { Link, Lines, useT } from '@/i18n/context';
import type { FounderProfile } from '@/data/company.server';
import { clientLogos } from '@/data/proof';
import { usePrimaryCta } from '@/lib/use-root-data';

type AboutPageProps = {
	founder: FounderProfile | null;
};

export function AboutPage({ founder }: AboutPageProps) {
	const t = useT();
	const cta = usePrimaryCta();

	return (
		<>
			<section className="page-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {t('about.eyebrow')}
					</span>
					<span className="hero-note">{t('about.note')}</span>
				</div>
				<h1>
					<Lines text={t('about.title')} />
				</h1>
				<p>{t('about.lede')}</p>
			</section>

			{founder && (
				<section className="section">
					<div className="founder">
						{founder.photo && <img className="founder-photo" src={founder.photo} alt={founder.name} width={480} height={600} />}
						<div className="founder-text">
							<span className="eyebrow">
								<i /> {t('about.founder.eyebrow')}
							</span>
							<h2>{founder.name}</h2>
							{(founder.role || founder.location) && (
								<p className="founder-meta">{[founder.role, founder.location].filter(Boolean).join(' · ')}</p>
							)}
							{founder.bio && <p className="founder-bio">{founder.bio}</p>}
							{founder.linkedIn && (
								<a className="discipline-cta" href={founder.linkedIn} target="_blank" rel="noopener noreferrer">
									{t('about.founder.linkedin')} <ArrowUpRight size={18} />
								</a>
							)}
						</div>
					</div>
				</section>
			)}

			<section className="section">
				<div className="about-grid">
					<div>
						<span className="eyebrow">
							<i /> {t('about.pov.eyebrow')}
						</span>
						<h2 style={{ marginTop: 24 }}>
							<Lines text={t('about.pov.title')} />
						</h2>
					</div>
					<div className="prose">
						<p>{t('about.pov.p1')}</p>
						<p>{t('about.pov.p2')}</p>
						<p>{t('about.pov.p3')}</p>
						<dl className="about-facts">
							<dt>{t('about.facts.studio')}</dt>
							<dd>{t('about.facts.studioValue')}</dd>
							<dt>{t('about.facts.disciplines')}</dt>
							<dd>{t('about.facts.disciplinesValue')}</dd>
							<dt>{t('about.facts.standard')}</dt>
							<dd>{t('about.facts.standardValue')}</dd>
							<dt>{t('about.facts.contact')}</dt>
							<dd>
								<Link to="/contact">hello@roaswell.com</Link>
							</dd>
						</dl>
					</div>
				</div>
			</section>

			{clientLogos.length > 0 && (
				<section className="section client-logos" aria-label={t('about.clients')}>
					<span className="eyebrow">
						<i /> {t('about.clients')}
					</span>
					<ul>
						{clientLogos.map(logo => (
							<li key={logo.name}>
								{logo.url ? (
									<a href={logo.url} target="_blank" rel="noopener noreferrer">
										<img src={logo.src} alt={logo.name} loading="lazy" />
									</a>
								) : (
									<img src={logo.src} alt={logo.name} loading="lazy" />
								)}
							</li>
						))}
					</ul>
				</section>
			)}

			<section className="section" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
				<div className="section-heading" style={{ marginBottom: 30 }}>
					<span className="eyebrow" style={{ color: '#b6b4ac' }}>
						<i /> {t('about.next.eyebrow')}
					</span>
					<h2 style={{ color: 'var(--paper)' }}>{t('about.next.title')}</h2>
				</div>
				<div className="related-grid">
					<Link to="/expertise" className="related-card dark">
						<h3>{t('nav.expertise')}</h3>
						<p>{t('about.next.expertise')}</p>
						<ArrowUpRight size={20} />
					</Link>
					<Link to="/approach" className="related-card dark">
						<h3>{t('nav.approach')}</h3>
						<p>{t('about.next.approach')}</p>
						<ArrowUpRight size={20} />
					</Link>
					{cta.external ? (
						<a href={cta.href} className="related-card dark" target="_blank" rel="noopener noreferrer">
							<h3>{t('nav.contact')}</h3>
							<p>{t(cta.labelKey)}</p>
							<ArrowUpRight size={20} />
						</a>
					) : (
						<Link to={cta.href} className="related-card dark">
							<h3>{t('nav.contact')}</h3>
							<p>{t(cta.labelKey)}</p>
							<ArrowUpRight size={20} />
						</Link>
					)}
				</div>
			</section>
		</>
	);
}
