import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { useInView, useReducedMotion } from 'framer-motion';
import { formatTimecode } from '@/lib/motion-math';

type Chapter = { at: number; label: string };

type MotionPlayerProps = {
	title: string;
	duration: number;
	poster: number;
	aspect: string;
	chapters?: Chapter[];
	maxStageHeight?: string;
	side?: (time: number) => ReactNode;
	children: (time: number) => ReactNode;
};

export function MotionPlayer({
	title,
	duration,
	poster,
	aspect,
	chapters = [],
	maxStageHeight,
	side,
	children,
}: MotionPlayerProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const reduced = useReducedMotion();
	const inView = useInView(rootRef, { margin: '-10% 0px -10% 0px' });
	const [time, setTime] = useState(poster);
	const [playing, setPlaying] = useState(false);
	const [touched, setTouched] = useState(false);
	const timeRef = useRef(poster);

	useEffect(() => {
		if (!touched && !reduced) setPlaying(true);
	}, [touched, reduced]);

	useEffect(() => {
		if (!playing || !inView) return;
		let frame = 0;
		let last = performance.now();
		const tick = (now: number) => {
			const delta = (now - last) / 1000;
			last = now;
			timeRef.current = (timeRef.current + delta) % duration;
			setTime(timeRef.current);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [playing, inView, duration]);

	function seek(next: number) {
		timeRef.current = next;
		setTime(next);
	}

	function togglePlaying() {
		setTouched(true);
		setPlaying(current => !current);
	}

	function handleScrub(event: React.ChangeEvent<HTMLInputElement>) {
		setTouched(true);
		setPlaying(false);
		seek(Number(event.target.value));
	}

	function jumpTo(at: number) {
		setTouched(true);
		setPlaying(false);
		seek(at + 0.01);
	}

	const activeChapter = chapters.reduce((active, chapter, index) => (time >= chapter.at ? index : active), 0);
	const stageStyle = { aspectRatio: aspect, maxHeight: maxStageHeight };

	return (
		<div ref={rootRef} className={side ? 'player player-with-side' : 'player'}>
			{side && <div className="player-side">{side(time)}</div>}
			<div className="player-main">
				<div className="player-stage" style={stageStyle} role="img" aria-label={title}>
					{children(time)}
					<span className="player-badge">CONCEPT SAMPLE</span>
				</div>
				<div className="player-bar">
					<button
						type="button"
						className="player-button"
						onClick={togglePlaying}
						aria-label={playing ? 'Pause sample' : 'Play sample'}
					>
						{playing ? <Pause size={16} /> : <Play size={16} />}
					</button>
					<input
						className="player-scrub"
						type="range"
						min={0}
						max={duration}
						step={0.01}
						value={time}
						onChange={handleScrub}
						aria-label="Scrub timeline"
						style={{ ['--progress' as string]: `${(time / duration) * 100}%` }}
					/>
					<span className="player-time">
						{formatTimecode(time)} / {formatTimecode(duration)}
					</span>
				</div>
				{chapters.length > 0 && (
					<div className="player-chapters">
						{chapters.map((chapter, index) => (
							<button
								key={chapter.label}
								type="button"
								className={index === activeChapter ? 'on' : ''}
								onClick={() => jumpTo(chapter.at)}
							>
								{chapter.label}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
