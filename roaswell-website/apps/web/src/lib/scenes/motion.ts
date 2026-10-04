import { clamp } from '@/lib/motion-math';
import { PAPER, RED, TAU, WINE, mix, rgba, roundRectPath, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const DURATION = 8;
const CAMERA = 9;
const PITCH = 0.5;
const UNIT = 78;
const CENTER_X = W / 2;
const CENTER_Y = 392;
const LIFT_UNITS = 1.3;
const MONO = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';

type Ease = [number, number, number, number];
type Keyframe = { time: number; value: number; ease: Ease };
type TrackName = 'POSITION' | 'SCALE' | 'ROTATION' | 'OPACITY';
type Track = { name: TrackName; keys: Keyframe[]; format: (value: number) => string };

const TRACKS: Track[] = [
	{
		name: 'POSITION',
		format: value => value.toFixed(2),
		keys: [
			{ time: 0, value: 0, ease: [0.16, 0.9, 0.3, 1] },
			{ time: 1.1, value: 1.5, ease: [0.55, 0, 1, 0.45] },
			{ time: 2.3, value: 0, ease: [0.2, 0.8, 0.4, 1] },
			{ time: 2.9, value: 0.45, ease: [0.55, 0, 1, 0.45] },
			{ time: 3.5, value: 0, ease: [0.16, 0.9, 0.3, 1] },
			{ time: 5, value: 1, ease: [0.55, 0, 1, 0.45] },
			{ time: 6.1, value: 0, ease: [0.2, 0.8, 0.4, 1] },
		],
	},
	{
		name: 'SCALE',
		format: value => `${value.toFixed(2)}x`,
		keys: [
			{ time: 0.5, value: 1, ease: [0.5, 0, 0.2, 1] },
			{ time: 2.4, value: 1.28, ease: [0.34, 1.4, 0.64, 1] },
			{ time: 3.9, value: 0.84, ease: [0.4, 0, 0.2, 1] },
			{ time: 5.6, value: 1.14, ease: [0.45, 0, 0.55, 1] },
			{ time: 7, value: 1, ease: [0.45, 0, 0.55, 1] },
		],
	},
	{
		name: 'ROTATION',
		format: value => `${Math.round(value)}°`,
		keys: [
			{ time: 0, value: 0, ease: [0.65, 0, 0.35, 1] },
			{ time: 1.6, value: 90, ease: [0.3, 0, 0.1, 1] },
			{ time: 3.2, value: 215, ease: [0.5, 0, 0.5, 1] },
			{ time: 4.8, value: 270, ease: [0.7, 0, 0.2, 1] },
			{ time: 6.4, value: 360, ease: [0.45, 0, 0.55, 1] },
		],
	},
	{
		name: 'OPACITY',
		format: value => `${Math.round(value * 100)}%`,
		keys: [
			{ time: 0.3, value: 0.25, ease: [0.42, 0, 0.58, 1] },
			{ time: 1.6, value: 0.9, ease: [0.42, 0, 0.58, 1] },
			{ time: 4.2, value: 0.3, ease: [0.25, 0.1, 0.25, 1] },
			{ time: 6, value: 0.9, ease: [0.42, 0, 0.58, 1] },
			{ time: 7.5, value: 0.25, ease: [0.42, 0, 0.58, 1] },
		],
	},
];

function bezierPoint(ease: Ease, u: number): [number, number] {
	const inv = 1 - u;
	const x = 3 * inv * inv * u * ease[0] + 3 * inv * u * u * ease[2] + u * u * u;
	const y = 3 * inv * inv * u * ease[1] + 3 * inv * u * u * ease[3] + u * u * u;
	return [x, y];
}

function easeBezierParam(ease: Ease, x: number) {
	let low = 0;
	let high = 1;
	for (let step = 0; step < 22; step += 1) {
		const mid = (low + high) / 2;
		if (bezierPoint(ease, mid)[0] < x) low = mid;
		else high = mid;
	}
	return (low + high) / 2;
}

function easeValue(ease: Ease, x: number) {
	return bezierPoint(ease, easeBezierParam(ease, x))[1];
}

function wrapTime(time: number) {
	return ((time % DURATION) + DURATION) % DURATION;
}

function valueAt(track: Track, time: number) {
	const { keys } = track;
	const t = wrapTime(time);
	if (t <= keys[0].time) return keys[0].value;
	for (let i = 0; i < keys.length - 1; i += 1) {
		if (t < keys[i + 1].time) {
			const progress = (t - keys[i].time) / (keys[i + 1].time - keys[i].time);
			return keys[i].value + (keys[i + 1].value - keys[i].value) * easeValue(keys[i].ease, progress);
		}
	}
	return keys[keys.length - 1].value;
}

type Segment = { track: number; index: number; start: number; end: number };

function focusSegment(time: number): Segment {
	let active: Segment | null = null;
	let ended: Segment | null = null;
	TRACKS.forEach((track, trackIndex) => {
		for (let i = 0; i < track.keys.length - 1; i += 1) {
			const segment = { track: trackIndex, index: i, start: track.keys[i].time, end: track.keys[i + 1].time };
			if (time >= segment.start && time < segment.end) {
				if (!active || segment.start > active.start) active = segment;
			} else if (time >= segment.end && (!ended || segment.end > ended.end)) {
				ended = segment;
			}
		}
	});
	return active ?? ended ?? { track: 0, index: 0, start: 0, end: TRACKS[0].keys[1].time };
}

type CubeState = { lift: number; scale: number; rotation: number; opacity: number };

function cubeStateAt(time: number): CubeState {
	return {
		lift: valueAt(TRACKS[0], time),
		scale: valueAt(TRACKS[1], time),
		rotation: (valueAt(TRACKS[2], time) * Math.PI) / 180,
		opacity: valueAt(TRACKS[3], time),
	};
}

type Vec = [number, number, number];

function project(point: Vec) {
	const cosPitch = Math.cos(PITCH);
	const sinPitch = Math.sin(PITCH);
	const y2 = point[1] * cosPitch + point[2] * sinPitch;
	const z2 = -point[1] * sinPitch + point[2] * cosPitch;
	const depth = CAMERA / (CAMERA + z2);
	return { x: CENTER_X + point[0] * UNIT * depth, y: CENTER_Y - (y2 - 1.3 * cosPitch) * UNIT * depth, z: z2, depth };
}

function rotateYaw(point: Vec, yaw: number): Vec {
	const cos = Math.cos(yaw);
	const sin = Math.sin(yaw);
	return [point[0] * cos + point[2] * sin, point[1], -point[0] * sin + point[2] * cos];
}

const VERTICES: Vec[] = [
	[-1, -1, -1],
	[1, -1, -1],
	[1, 1, -1],
	[-1, 1, -1],
	[-1, -1, 1],
	[1, -1, 1],
	[1, 1, 1],
	[-1, 1, 1],
];

const FACES: { corners: [number, number, number, number]; normal: Vec }[] = [
	{ corners: [0, 1, 2, 3], normal: [0, 0, -1] },
	{ corners: [5, 4, 7, 6], normal: [0, 0, 1] },
	{ corners: [4, 0, 3, 7], normal: [-1, 0, 0] },
	{ corners: [1, 5, 6, 2], normal: [1, 0, 0] },
	{ corners: [3, 2, 6, 7], normal: [0, 1, 0] },
	{ corners: [4, 5, 1, 0], normal: [0, -1, 0] },
];

const LIGHT: Vec = [-0.45, 0.85, -0.55];

function placeVertex(vertex: Vec, state: CubeState): Vec {
	const scaled: Vec = [vertex[0] * state.scale, vertex[1] * state.scale, vertex[2] * state.scale];
	const turned = rotateYaw(scaled, state.rotation);
	return [turned[0], turned[1] + state.scale + state.lift * LIFT_UNITS, turned[2]];
}

function drawFloor(ctx: CanvasRenderingContext2D, state: CubeState) {
	ctx.globalCompositeOperation = 'source-over';
	const extent = 6;
	for (let line = -extent; line <= extent; line += 1) {
		const fade = 1 - Math.abs(line) / (extent + 1);
		ctx.strokeStyle = rgba(PAPER, 0.05 + 0.1 * fade * fade);
		ctx.lineWidth = 1;
		const a = project([line, 0, -extent]);
		const b = project([line, 0, extent]);
		ctx.beginPath();
		ctx.moveTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
		ctx.stroke();
		const c = project([-extent, 0, line]);
		const d = project([extent, 0, line]);
		ctx.beginPath();
		ctx.moveTo(c.x, c.y);
		ctx.lineTo(d.x, d.y);
		ctx.stroke();
	}

	const center = project([0, 0, 0]);
	const height = state.lift * LIFT_UNITS;
	const spread = state.scale * (1 + height * 0.18);
	const strength = clamp(0.8 - height * 0.28);
	ctx.save();
	ctx.translate(center.x, center.y);
	ctx.scale(1, Math.sin(PITCH));
	const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, UNIT * 2.1 * spread);
	shadow.addColorStop(0, rgba(RED, 0.55 * strength));
	shadow.addColorStop(0.45, rgba(WINE, 0.4 * strength));
	shadow.addColorStop(1, rgba(WINE, 0));
	ctx.fillStyle = shadow;
	ctx.beginPath();
	ctx.arc(0, 0, UNIT * 2.1 * spread, 0, TAU);
	ctx.fill();
	ctx.restore();
}

function drawCube(ctx: CanvasRenderingContext2D, state: CubeState, wireOnly: boolean, alpha: number) {
	const placed = VERTICES.map(vertex => placeVertex(vertex, state));
	const projected = placed.map(project);

	const faces = FACES.map(face => {
		const normal = rotateYaw(face.normal, state.rotation);
		const cosPitch = Math.cos(PITCH);
		const sinPitch = Math.sin(PITCH);
		const normalZ = -normal[1] * sinPitch + normal[2] * cosPitch;
		const depth = face.corners.reduce((sum, corner) => sum + projected[corner].z, 0) / 4;
		const light = clamp(normal[0] * LIGHT[0] + normal[1] * LIGHT[1] + normal[2] * LIGHT[2]);
		return { face, facing: normalZ < 0, depth, light };
	}).sort((a, b) => b.depth - a.depth);

	faces.forEach(({ face, facing, light }) => {
		const points = face.corners.map(corner => projected[corner]);
		ctx.globalCompositeOperation = 'source-over';
		ctx.beginPath();
		points.forEach((point, index) => (index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
		ctx.closePath();

		if (!wireOnly) {
			const tone = mix(WINE, RED, 0.25 + light * 0.75);
			ctx.fillStyle = rgba(tone, alpha * state.opacity * (facing ? 0.18 + light * 0.62 : 0.06));
			ctx.fill();
		}

		ctx.globalCompositeOperation = 'lighter';
		if (!wireOnly && facing) {
			ctx.strokeStyle = rgba(PAPER, 0.16 * state.opacity);
			ctx.lineWidth = 1;
			for (let step = 1; step < 4; step += 1) {
				const k = step / 4;
				const lerpPoint = (from: (typeof points)[number], to: (typeof points)[number]) => ({
					x: from.x + (to.x - from.x) * k,
					y: from.y + (to.y - from.y) * k,
				});
				const a = lerpPoint(points[0], points[1]);
				const b = lerpPoint(points[3], points[2]);
				const c = lerpPoint(points[0], points[3]);
				const d = lerpPoint(points[1], points[2]);
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.moveTo(c.x, c.y);
				ctx.lineTo(d.x, d.y);
				ctx.stroke();
			}
		}

		const edgeAlpha = (facing ? 1 : 0.28) * alpha;
		ctx.beginPath();
		points.forEach((point, index) => (index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
		ctx.closePath();
		if (!wireOnly) {
			ctx.strokeStyle = rgba(RED, 0.3 * edgeAlpha);
			ctx.lineWidth = 7;
			ctx.stroke();
		}
		ctx.strokeStyle = rgba(PAPER, (wireOnly ? 0.6 : 0.95) * edgeAlpha);
		ctx.lineWidth = wireOnly ? 1.2 : 1.8;
		ctx.stroke();
	});

	if (!wireOnly) {
		projected.forEach(point => {
			ctx.fillStyle = rgba(PAPER, 0.9);
			ctx.beginPath();
			ctx.arc(point.x, point.y, 2.4, 0, TAU);
			ctx.fill();
		});
	}
}

function drawFrameMarks(ctx: CanvasRenderingContext2D, t: number, state: CubeState) {
	ctx.globalCompositeOperation = 'source-over';
	ctx.strokeStyle = rgba(PAPER, 0.28);
	ctx.lineWidth = 1.2;
	const inset = 44;
	const arm = 22;
	const corners: [number, number, number, number][] = [
		[inset, inset, 1, 1],
		[W - inset, inset, -1, 1],
		[inset, 654, 1, -1],
		[W - inset, 654, -1, -1],
	];
	corners.forEach(([x, y, dx, dy]) => {
		ctx.beginPath();
		ctx.moveTo(x + dx * arm, y);
		ctx.lineTo(x, y);
		ctx.lineTo(x, y + dy * arm);
		ctx.stroke();
	});

	const frames = Math.floor(t * 60);
	const code = `00:0${Math.floor(frames / 60)}:${String(frames % 60).padStart(2, '0')}`;
	ctx.font = MONO;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.fillStyle = rgba(RED, 0.95);
	ctx.fillText(code, inset + 14, 630);

	const readouts = [
		`POS ${TRACKS[0].format(state.lift)}`,
		`SCALE ${TRACKS[1].format(state.scale)}`,
		`ROT ${TRACKS[2].format((state.rotation * 180) / Math.PI)}`,
		`OPA ${TRACKS[3].format(state.opacity)}`,
	];
	ctx.textAlign = 'right';
	ctx.fillStyle = rgba(PAPER, 0.5);
	ctx.fillText(readouts.join('   '), W - inset - 14, 630);
}

function drawTimeline(ctx: CanvasRenderingContext2D, t: number, focus: Segment) {
	const x0 = 150;
	const x1 = 800;
	const top = 712;
	const rowHeight = 38;
	const panelTop = 688;
	const timeToX = (time: number) => x0 + ((x1 - x0) * time) / DURATION;

	ctx.globalCompositeOperation = 'source-over';
	roundRectPath(ctx, 56, panelTop, x1 - 56 + 24, 214, 18);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
	ctx.lineWidth = 1;
	ctx.stroke();

	ctx.font = MONO;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';

	for (let tick = 0; tick <= 8; tick += 1) {
		const x = timeToX(tick);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
		ctx.beginPath();
		ctx.moveTo(x, top - 6);
		ctx.lineTo(x, top + rowHeight * TRACKS.length + 4);
		ctx.stroke();
		ctx.fillStyle = rgba(PAPER, 0.32);
		ctx.fillText(`${tick}s`, x + 4, top - 12);
	}

	TRACKS.forEach((track, row) => {
		const y = top + row * rowHeight + rowHeight / 2;
		const focused = focus.track === row;
		ctx.fillStyle = focused ? rgba(RED, 1) : rgba(PAPER, 0.55);
		ctx.textAlign = 'left';
		ctx.fillText(track.name, 76, y);

		for (let i = 0; i < track.keys.length - 1; i += 1) {
			const a = track.keys[i];
			const b = track.keys[i + 1];
			const startX = timeToX(a.time);
			const endX = timeToX(b.time);
			const selected = focused && focus.index === i;
			const running = t >= a.time && t < b.time;
			roundRectPath(ctx, startX + 3, y - 5, endX - startX - 6, 10, 5);
			ctx.fillStyle = selected ? rgba(RED, 0.4) : 'rgba(255, 255, 255, 0.07)';
			ctx.fill();
			if (running) {
				const filled = ((t - a.time) / (b.time - a.time)) * (endX - startX - 6);
				roundRectPath(ctx, startX + 3, y - 5, Math.max(10, filled), 10, 5);
				ctx.fillStyle = selected ? rgba(RED, 0.95) : rgba(PAPER, 0.4);
				ctx.fill();
			}
		}

		track.keys.forEach(key => {
			const flash = Math.pow(clamp(1 - Math.abs(t - key.time) / 0.35), 2);
			const size = 6 + flash * 4;
			ctx.save();
			ctx.translate(timeToX(key.time), y);
			ctx.rotate(Math.PI / 4);
			ctx.fillStyle = t >= key.time ? rgba(PAPER, 0.95) : rgba(PAPER, 0.4);
			if (flash > 0) {
				ctx.shadowColor = rgba(RED, 1);
				ctx.shadowBlur = 16 * flash;
			}
			ctx.fillRect(-size / 2, -size / 2, size, size);
			ctx.restore();
		});
	});

	ctx.shadowBlur = 0;
	const playheadX = timeToX(t);
	const lineBottom = top + rowHeight * TRACKS.length + 8;
	const lineGlow = ctx.createLinearGradient(playheadX - 8, 0, playheadX + 8, 0);
	lineGlow.addColorStop(0, rgba(RED, 0));
	lineGlow.addColorStop(0.5, rgba(RED, 0.35));
	lineGlow.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = lineGlow;
	ctx.fillRect(playheadX - 8, top - 22, 16, lineBottom - top + 22);
	ctx.fillStyle = rgba(RED, 1);
	ctx.fillRect(playheadX - 0.75, top - 22, 1.5, lineBottom - top + 22);
	ctx.beginPath();
	ctx.moveTo(playheadX - 6, top - 24);
	ctx.lineTo(playheadX + 6, top - 24);
	ctx.lineTo(playheadX, top - 14);
	ctx.closePath();
	ctx.fill();
}

function drawCurveEditor(ctx: CanvasRenderingContext2D, t: number, focus: Segment) {
	const left = 850;
	const top = 688;
	const panelW = 374;
	const panelH = 214;
	const boxX = left + 42;
	const boxY = top + 40;
	const boxW = 288;
	const boxH = 148;
	const track = TRACKS[focus.track];
	const from = track.keys[focus.index];
	const to = track.keys[focus.index + 1];
	const ease = from.ease;
	const rangeLow = -0.3;
	const rangeHigh = 1.3;
	const toX = (value: number) => boxX + value * boxW;
	const toY = (value: number) => boxY + boxH - ((value - rangeLow) / (rangeHigh - rangeLow)) * boxH;
	const progress = clamp((t - from.time) / (to.time - from.time));
	const eased = easeValue(ease, progress);

	ctx.globalCompositeOperation = 'source-over';
	roundRectPath(ctx, left, top, panelW, panelH, 18);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
	ctx.lineWidth = 1;
	ctx.stroke();

	ctx.font = MONO;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.fillStyle = rgba(RED, 1);
	ctx.fillText(track.name, left + 22, top + 20);
	ctx.fillStyle = rgba(PAPER, 0.45);
	ctx.fillText(`${track.format(from.value)} → ${track.format(to.value)}`, left + 22 + 92, top + 20);
	ctx.textAlign = 'right';
	ctx.fillText(`cubic-bezier(${ease.join(', ')})`, left + panelW - 22, top + panelH - 14);

	ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
	for (let line = 0; line <= 4; line += 1) {
		ctx.beginPath();
		ctx.moveTo(boxX + (boxW * line) / 4, boxY);
		ctx.lineTo(boxX + (boxW * line) / 4, boxY + boxH);
		ctx.stroke();
	}
	[0, 1].forEach(level => {
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
		ctx.beginPath();
		ctx.moveTo(boxX, toY(level));
		ctx.lineTo(boxX + boxW, toY(level));
		ctx.stroke();
	});

	ctx.strokeStyle = rgba(PAPER, 0.4);
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(toX(0), toY(0));
	ctx.lineTo(toX(ease[0]), toY(ease[1]));
	ctx.moveTo(toX(1), toY(1));
	ctx.lineTo(toX(ease[2]), toY(ease[3]));
	ctx.stroke();

	ctx.globalCompositeOperation = 'lighter';
	ctx.lineJoin = 'round';
	ctx.strokeStyle = rgba(RED, 0.25);
	ctx.lineWidth = 2;
	ctx.beginPath();
	for (let step = 0; step <= 60; step += 1) {
		const [x, y] = bezierPoint(ease, step / 60);
		if (step === 0) ctx.moveTo(toX(x), toY(y));
		else ctx.lineTo(toX(x), toY(y));
	}
	ctx.stroke();

	ctx.strokeStyle = rgba(RED, 1);
	ctx.lineWidth = 2.6;
	ctx.shadowColor = rgba(RED, 0.9);
	ctx.shadowBlur = 12;
	ctx.beginPath();
	const reached = easeBezierParam(ease, progress);
	for (let step = 0; step <= 40; step += 1) {
		const [x, y] = bezierPoint(ease, (reached * step) / 40);
		if (step === 0) ctx.moveTo(toX(x), toY(y));
		else ctx.lineTo(toX(x), toY(y));
	}
	ctx.stroke();
	ctx.shadowBlur = 0;

	ctx.globalCompositeOperation = 'source-over';
	[
		[ease[0], ease[1]],
		[ease[2], ease[3]],
	].forEach(([x, y]) => {
		ctx.fillStyle = '#0a0a0d';
		ctx.strokeStyle = rgba(PAPER, 0.95);
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(toX(x), toY(y), 5.5, 0, TAU);
		ctx.fill();
		ctx.stroke();
	});

	ctx.strokeStyle = rgba(RED, 0.4);
	ctx.lineWidth = 1;
	ctx.setLineDash([2, 4]);
	ctx.beginPath();
	ctx.moveTo(toX(progress), toY(eased));
	ctx.lineTo(toX(progress), toY(rangeLow));
	ctx.moveTo(toX(progress), toY(eased));
	ctx.lineTo(toX(0), toY(eased));
	ctx.stroke();
	ctx.setLineDash([]);

	ctx.globalCompositeOperation = 'lighter';
	const glow = ctx.createRadialGradient(toX(progress), toY(eased), 0, toX(progress), toY(eased), 20);
	glow.addColorStop(0, rgba(PAPER, 0.95));
	glow.addColorStop(0.3, rgba(RED, 0.7));
	glow.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = glow;
	ctx.fillRect(toX(progress) - 20, toY(eased) - 20, 40, 40);
}

export const motionScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 2.0,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.1);
		const state = cubeStateAt(t);
		const focus = focusSegment(t);

		drawFloor(ctx, state);
		for (let ghost = 4; ghost >= 1; ghost -= 1) {
			drawCube(ctx, cubeStateAt(t - ghost * 0.05), true, 0.2 / ghost);
		}
		drawCube(ctx, state, false, 1);
		drawFrameMarks(ctx, t, state);
		drawTimeline(ctx, t, focus);
		drawCurveEditor(ctx, t, focus);
		sceneVignette(ctx, W, H);
		ctx.globalCompositeOperation = 'source-over';
	},
};
