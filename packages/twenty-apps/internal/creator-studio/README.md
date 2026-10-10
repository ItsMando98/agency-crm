# Creator Studio

Twenty app for AI UGC creator profiles. A creator holds persona, look, voice and rules. An asset is one generated picture, voice clip or short video of a creator.

## How a generation runs

1. A record is created in `UGC assets` (from the Roaswell app or in Twenty) with status `QUEUED`, a creator, a type and a scene or script.
2. The `run-ugc-asset` function picks it up, calls treg and writes the result back: file, cost in USD, status.
3. `fail-stuck-ugc-assets` marks assets that did not finish within 20 minutes as failed.

## Providers (through treg)

| Type | Endpoint | Cost |
| --- | --- | --- |
| Image | `reapi.image-gen.gemini-3-pro-image` (1K, 9:16) | about 0.03 USD |
| Voice | `google-ai.voice-gen.gemini-3-8-flash-tts` | below 0.01 USD per line |
| Video | `replicate.video-gen.veo-3.1-fast` (720p, 4, 6 or 8 s) | 0.10 USD per second, 0.15 with sound |

Each call carries a cost ceiling, treg refuses a call above it and charges nothing.

## Setup

Set `TREG_TOKEN` (and `TREG_ORG` for tokens from the treg login) in the app variables.

## Content rules

Every creator has an `AI disclosure` label. Publish generated content only with that label, and never model a real person without their written consent.
