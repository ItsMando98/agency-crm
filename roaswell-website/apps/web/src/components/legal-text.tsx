import type { ReactNode } from 'react';

type LegalTextProps = {
	text: string;
};

function renderBlock(block: string, index: number): ReactNode {
	const lines = block.split('\n');
	if (lines.every(line => line.startsWith('- '))) {
		return (
			<ul key={index}>
				{lines.map(line => (
					<li key={line}>{line.slice(2)}</li>
				))}
			</ul>
		);
	}
	return <p key={index}>{block}</p>;
}

export function LegalText({ text }: LegalTextProps) {
	return <>{text.split('\n\n').map(renderBlock)}</>;
}
