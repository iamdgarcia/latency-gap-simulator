---
title: Voice Latency Gap Simulator
emoji: 🪜
colorFrom: red
colorTo: yellow
sdk: static
app_file: index.html
short_description: Where the milliseconds go in a voice-agent turn, visualized
tags:
  - voice-agent
  - latency
  - turn-taking
---

# Voice Latency Gap Simulator
**▶ Try it live:** <https://iamdgarcia-latency-gap-simulator.static.hf.space> · **Code on GitHub:** <https://github.com/iamdgarcia/latency-gap-simulator>

An interactive, honest explainer of **where the milliseconds go** in one voice-agent turn —
from the moment the user stops talking to the first word of bot audio — and what each
endpointing decision costs.

Drag the sliders, load a preset (**Robust / Snappy / Cascaded big-LLM / S2S duplex**), turn on
**barge-in** and watch how much bot audio gets wasted when the user interrupts.

- 100% client-side vanilla JS — no model, no audio, no network calls.
- Waterfall of the turn pipeline: speech tail → hangover → silence check → ASR finalize →
  uplink RTT → LLM TTFT → downlink RTT → TTS first chunk.
- Per-stage explanation cards (what it is, why it exists, typical range).
- EN/ES toggle.

**This is a teaching approximation**, not a benchmark: real stacks vary (streaming codecs,
half-duplex echo guards, speculative TTS). The barge-in waste model is
`min-speech + hangover/2 + downlink RTT` — aggressive hangover wastes more, which is the point.

KPI & latency thinking from *Latency floors for cascaded voice agents — D. García Peña (research)*.

Built by [iamdgarcia](https://huggingface.co/iamdgarcia) — realtime voice agent engineering.
