let audioCtx: AudioContext | null = null;

const ensureCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
};

export const initAudioOnGesture = () => {
  const handler = () => ensureCtx();
  window.addEventListener("pointerdown", handler, { once: true });
  window.addEventListener("keydown", handler, { once: true });
};

export const playLock = () => {
  try {
    const ctx = ensureCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.07);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  } catch {
    /* audio unavailable */
  }
};

export const playWhoosh = () => {
  try {
    const ctx = ensureCtx();
    const t = ctx.currentTime;
    const length = Math.floor(ctx.sampleRate * 0.7);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(350, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.55);
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.07, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.68);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);
  } catch {
    /* audio unavailable */
  }
};

let crackle: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

export const startCrackle = () => {
  try {
    const ctx = ensureCtx();
    if (crackle) return;
    const length = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      let v = last * 1.6;
      if (Math.random() < 0.0006) v += (Math.random() * 2 - 1) * 0.8;
      data[i] = v * 0.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.7);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    crackle = { src, gain };
  } catch {
    /* audio unavailable */
  }
};

export const stopCrackle = () => {
  if (!crackle || !audioCtx) return;
  const { src, gain } = crackle;
  crackle = null;
  try {
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    window.setTimeout(() => {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    }, 350);
  } catch {
    /* audio unavailable */
  }
};
