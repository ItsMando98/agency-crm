import { ScrollWords } from '@/components/motion/primitives';
import { useT } from '@/i18n/context';

export function Manifesto() {
	const t = useT();

	return (
		<section className="manifesto section" aria-labelledby="manifesto-label">
			<span className="eyebrow" id="manifesto-label">
				<i /> {t('manifesto.eyebrow')}
			</span>
			<ScrollWords className="manifesto-text" text={t('manifesto.text')} />
		</section>
	);
}
