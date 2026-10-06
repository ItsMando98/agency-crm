import { LegalText } from '@/components/legal-text';
import { Lines, useT } from '@/i18n/context';

type LegalSection = { key: string; title: string; body: string };

type LegalDocumentProps = {
	eyebrow: string;
	title: string;
	lede: string;
	sections: LegalSection[];
	notice?: string;
};

export function LegalDocument({ eyebrow, title, lede, sections, notice }: LegalDocumentProps) {
	const t = useT();

	return (
		<>
			<section className="page-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {eyebrow}
					</span>
					<span className="hero-note">{t('legal.updated')}</span>
				</div>
				<h1 className="legal-title">
					<Lines text={title} />
				</h1>
				<p>{lede}</p>
			</section>

			<section className="section">
				<div className="legal-body prose">
					{notice && <blockquote>{notice}</blockquote>}
					{sections.map(section => (
						<div key={section.key} className="legal-section">
							<h2>{section.title}</h2>
							<LegalText text={section.body} />
						</div>
					))}
				</div>
			</section>
		</>
	);
}
