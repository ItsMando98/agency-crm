# Motion sources

Looping videos used on the site, authored as [Hyperframes](https://github.com/heygen-com/hyperframes) compositions: one HTML file per loop, a canvas scene driven by a paused GSAP timeline, rendered to video by a headless browser. All motion is deterministic math of time, so every render is identical, and each loop is built from whole cycles so the last frame flows into the first.

| Folder | Used for | Size | Length |
| --- | --- | --- | --- |
| `hero-loop` | Home hero background: a calm dot field with a travelling light | 1920x1080 | 10 s |
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

This writes `out/<folder>.mp4` at 24 fps. Optimise for the web and copy into `apps/web/public` (the names the site expects are `<name>.mp4`, `<name>.webm` and a poster):

```bash
SCALE=1280:960   # 1600:900 for hero-loop, 1600:-2 for footer-loop
ffmpeg -i out/expertise-seo.mp4 -vf scale=$SCALE:flags=lanczos \
  -c:v libx264 -preset veryslow -crf 30 -pix_fmt yuv420p -movflags +faststart -an \
  ../../apps/web/public/expertise-seo.mp4

ffmpeg -i out/expertise-seo.mp4 -vf scale=$SCALE:flags=lanczos \
  -c:v libvpx-vp9 -b:v 0 -crf 37 -row-mt 1 -pix_fmt yuv420p -an \
  ../../apps/web/public/expertise-seo.webm

ffmpeg -ss 3.0 -i out/expertise-seo.mp4 -frames:v 1 -vf scale=$SCALE:flags=lanczos -q:v 4 \
  ../../apps/web/public/expertise-seo-poster.jpg
```

Poster names: `hero-poster.jpg`, `footer-poster.jpg`, and `expertise-<name>-poster.jpg`.

Keep `DURATION` in each `index.html` in step with `data-duration`. Keep every cycle count a whole number per loop.
