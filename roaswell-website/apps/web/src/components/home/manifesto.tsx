import { ScrollWords } from '@/components/motion/primitives';

const TEXT =
	'Most agencies sell channels. We build growth systems. Search captures intent. Content builds demand. Paid media accelerates what works. Pull one out and the whole machine loses leverage. Together, they compound.';

export function Manifesto() {
	return (
		<section className="manifesto section" aria-labelledby="manifesto-label">
			<span className="eyebrow" id="manifesto-label">
				<i /> THE POINT OF VIEW
			</span>
			<ScrollWords
				className="manifesto-text"
				text={TEXT}
				highlight={['systems', 'compound', 'intent', 'demand', 'accelerates']}
			/>
		</section>
	);
}
