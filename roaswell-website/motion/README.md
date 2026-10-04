# Motion sources

Looping videos used on the site, authored as [Hyperframes](https://github.com/heygen-com/hyperframes) compositions: one HTML file per loop, a canvas scene driven by a paused GSAP timeline, rendered to video by a headless browser. All motion is deterministic math of time, so every render is identical, and each loop is built from whole cycles so the last frame flows into the first.

| Folder | Used for | Size | Length |
| --- | --- | --- | --- |
| `hero-loop` | Home hero background: a calm dot field with a travelling light | 2560x1440 | 10 s |
| `expertise-seo` | Expertise section: a result climbing the rankings | 1280x960 | 6 s |
| `expertise-meta` | Expertise section: creative tests narrowing to a winner | 1280x960 | 6 s |
| `expertise-google` | Expertise section: intent converging on action | 1280x960 | 6 s |
| `expertise-motion` | Expertise section: an easing curve driving a ball | 1280x960 | 6 s |
| `footer-loop` | Footer background: growth skyline, signal line, particles | 1920x800 | 8 s |

## Render

From any folder:

```bash
npm run check
npm run render
```

This writes `out/<folder>.mp4` at 24 fps. Encode for the web and copy into `apps/web/public` (the site expects `<name>.mp4`, `<name>.webm` and a poster). Keep the hero at its native 2560x1440 so it stays sharp on large and retina screens; the footer and expertise loops are used at their rendered size.

```bash
ffmpeg -i out/hero-loop.mp4 \
  -c:v libx264 -preset veryslow -crf 22 -pix_fmt yuv420p -movflags +faststart -an \
  ../../apps/web/public/hero-loop.mp4

ffmpeg -i out/hero-loop.mp4 \
  -c:v libvpx-vp9 -b:v 0 -crf 20 -row-mt 1 -pix_fmt yuv420p -an \
  ../../apps/web/public/hero-loop.webm

ffmpeg -ss 2.5 -i out/hero-loop.mp4 -frames:v 1 -q:v 2 ../../apps/web/public/hero-poster.jpg
```

For the footer and expertise loops use `-crf 24` (MP4) and `-crf 31` (WebM). Do not scale them down: smooth gradients band badly when over-compressed.

The hero scene draws a faint static dither over the frame, which hides gradient banding after encoding.

Poster names: `hero-poster.jpg`, `footer-poster.jpg`, and `expertise-<name>-poster.jpg`.

Keep `DURATION` in each `index.html` in step with `data-duration`. Keep every cycle count a whole number per loop.
