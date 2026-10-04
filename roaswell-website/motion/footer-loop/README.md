# Footer loop

Source for the looping background video behind the site footer. It is a [Hyperframes](https://github.com/heygen-com/hyperframes) composition: one HTML file with a canvas scene driven by a paused GSAP timeline, rendered to video by a headless browser.

The scene is an 8 second seamless loop at 1920x800: a glowing growth skyline, a travelling signal line, rising particles and pulsing rings. All motion is deterministic math of time, so every render is identical.

## Re-render

```bash
cd roaswell-website/motion/footer-loop
npm run check
npm run render
```

`render` writes `out/footer-loop.mp4` (24 fps, high quality, about 9 MB). Optimise it for the web and copy it into the site:

```bash
ffmpeg -i out/footer-loop.mp4 -vf scale=1600:-2:flags=lanczos \
  -c:v libx264 -preset veryslow -crf 30 -pix_fmt yuv420p -movflags +faststart -an \
  ../../apps/web/public/footer-loop.mp4

ffmpeg -i out/footer-loop.mp4 -vf scale=1600:-2:flags=lanczos \
  -c:v libvpx-vp9 -b:v 0 -crf 37 -row-mt 1 -pix_fmt yuv420p -an \
  ../../apps/web/public/footer-loop.webm

ffmpeg -ss 3.2 -i out/footer-loop.mp4 -frames:v 1 -vf scale=1600:-2 -q:v 4 \
  ../../apps/web/public/footer-poster.jpg
```

Keep the loop length, `DURATION`, in step with `data-duration` in `index.html`. Every cycle count in the scene is a whole number per loop, which is what keeps the last frame flowing into the first.
