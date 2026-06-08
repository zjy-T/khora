// A short, soft two-note chime synthesized with the Web Audio API — no audio
// asset to ship or load. Used to alert the agent when a new customer message
// arrives. Safe to call anywhere; it no-ops on the server or if audio is blocked.

let ctx: AudioContext | null = null;

export function playChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    ctx = ctx ?? new AudioCtx();
    // Browsers may suspend the context until a user gesture; resume if needed.
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    // Two ascending notes (E5 → A5) for a gentle, brand-quiet "ping".
    const notes = [
      { freq: 659.25, start: 0, dur: 0.16 },
      { freq: 880.0, start: 0.12, dur: 0.22 },
    ];
    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = n.freq;
      gain.gain.setValueAtTime(0, now + n.start);
      gain.gain.linearRampToValueAtTime(0.18, now + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.02);
    }
  } catch {
    /* audio unavailable — ignore */
  }
}
