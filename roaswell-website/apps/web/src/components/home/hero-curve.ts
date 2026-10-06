import { clamp, easeInOutCubic } from '@/lib/motion-math';

export const CURVE_X0 = 0.6;
export const CURVE_X1 = 0.955;
export const REVEAL_START = 0.6;
export const REVEAL_TIME = 2.8;

export const NODES = [
	{ u: 0.3, index: '01', labelKey: 'hero.node.1' },
	{ u: 0.6, index: '02', labelKey: 'hero.node.2' },
	{ u: 0.88, index: '03', labelKey: 'hero.node.3' },
] as const;

function growth(u: number) {
	const smooth = u * u * (3 - 2 * u);
	return 0.68 * smooth + 0.32 * u;
}

export const curveX = (u: number) => CURVE_X0 + (CURVE_X1 - CURVE_X0) * u;

export const curveY = (u: number, wave = 0) => 0.93 - 0.74 * growth(u) + wave;

export const benchmarkY = (u: number) => 0.93 - 0.17 * u - 0.025 * Math.sin(u * 4.2);

export const revealAt = (time: number) => easeInOutCubic(clamp((time - REVEAL_START) / REVEAL_TIME));

export function timeForReveal(u: number) {
	let lo = 0;
	let hi = 1;
	for (let i = 0; i < 24; i += 1) {
		const mid = (lo + hi) / 2;
		if (easeInOutCubic(mid) < u) lo = mid;
		else hi = mid;
	}
	return REVEAL_START + REVEAL_TIME * hi;
}
