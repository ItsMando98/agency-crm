export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

export const round = (value: number) => Math.round(value * 100) / 100;

export const linear = (progress: number) => progress;

export const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

export const easeInCubic = (progress: number) => progress * progress * progress;

export const easeInOutCubic = (progress: number) =>
	progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

export const easeOutExpo = (progress: number) => (progress >= 1 ? 1 : 1 - Math.pow(2, -10 * progress));

export const easeOutBack = (progress: number) => {
	const overshoot = 1.70158;
	return 1 + (overshoot + 1) * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2);
};

export const easeOutBounce = (progress: number) => {
	const n = 7.5625;
	const d = 2.75;
	if (progress < 1 / d) return n * progress * progress;
	if (progress < 2 / d) return n * (progress -= 1.5 / d) * progress + 0.75;
	if (progress < 2.5 / d) return n * (progress -= 2.25 / d) * progress + 0.9375;
	return n * (progress -= 2.625 / d) * progress + 0.984375;
};

type Easing = (progress: number) => number;

export function seg(time: number, start: number, end: number, ease: Easing = linear) {
	return ease(clamp((time - start) / (end - start)));
}

export function pulse(time: number, start: number, peak: number, end: number) {
	return clamp(Math.min((time - start) / (peak - start), (end - time) / (end - peak)));
}

export function seeded(index: number, salt = 1) {
	const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
	return value - Math.floor(value);
}

export function formatTimecode(seconds: number) {
	const whole = Math.floor(seconds);
	const frames = Math.floor((seconds - whole) * 24);
	return `00:${String(whole).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}
