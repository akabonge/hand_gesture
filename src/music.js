/* Live-composed acoustic score. Every note is synthesized in the browser with Web Audio,
   so there are no recordings to license. Styles (set per chapter in story.js, `music`):
     amadinda  Buganda-inspired interlocking log xylophone (two parts, five-note scale)
     guitar    fingerpicked nylon-string lullaby (Karplus-Strong plucked strings)
     piano     soft music-box style lullaby in 3/4
     hymn      slow organ chords in a stone church, with a distant tolling bell
     bells     church bells ringing rounds over a quiet hymn
     baganda   amadinda-style parts with hand drums and a gourd rattle
     groove    an original bass-and-finger-snap groove (no existing song is quoted)
   Inspired by, not copies of, any traditional piece or recording. */

const LOOKAHEAD = 0.25; // seconds of notes scheduled ahead
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function createMusic() {
  let ctx = null, out = null, dry = null, wet = null, verb = null, timer = null;
  let style = null, step = 0, nextTime = 0, level = 0;
  const ksCache = new Map();

  function init(audioCtx) {
    if (ctx) return;
    ctx = audioCtx;
    out = ctx.createGain(); out.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    dry = ctx.createGain(); wet = ctx.createGain();
    verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.4);
    dry.connect(comp); wet.connect(verb); verb.connect(comp); comp.connect(out); out.connect(ctx.destination);
  }

  // Reverb: exponentially decaying stereo noise, like a hall or a church.
  function impulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return buf;
  }

  function voice(gain = 1, sendAmt = 0.35) {
    const g = ctx.createGain(); g.gain.value = gain;
    const s = ctx.createGain(); s.gain.value = sendAmt;
    g.connect(dry); g.connect(s); s.connect(wet);
    return g;
  }

  function partial(dest, f, t, amp, attack, decay, type = 'sine') {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, amp), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + attack + decay + 0.05);
  }

  /* ---------------- instruments ---------------- */
  // Wooden log: strong fundamental plus the ~3.9x overtone of a struck bar, fast decay, mallet click.
  function log(f, t, vel = 1) {
    const v = voice(0.5 * vel, 0.25);
    partial(v, f, t, 0.9, 0.002, 0.38);
    partial(v, f * 3.93, t, 0.22, 0.001, 0.09);
    partial(v, f * 9.2, t, 0.05, 0.001, 0.03);
  }

  // Piano-ish: slightly inharmonic partials, brighter attack, upper partials die first.
  function piano(f, t, vel = 1, len = 2.2) {
    const v = voice(0.32 * vel, 0.4);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(v);
    for (let n = 1; n <= 6; n++) partial(lp, f * n * Math.sqrt(1 + 0.0004 * n * n), t, 0.8 / Math.pow(n, 1.4), 0.004, len / (1 + n * 0.45));
  }

  // Nylon guitar: Karplus-Strong plucked string, rendered once per pitch and cached.
  function guitar(f, t, vel = 1) {
    const key = Math.round(f * 10);
    let buf = ksCache.get(key);
    if (!buf) {
      const sr = ctx.sampleRate, len = Math.floor(sr * 2.4), period = Math.round(sr / f);
      buf = ctx.createBuffer(1, len, sr);
      const d = buf.getChannelData(0), ring = new Float32Array(period);
      for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
      for (let i = 0, p = 0; i < len; i++) {
        const nxt = (p + 1) % period, val = 0.4985 * (ring[p] + ring[nxt]);
        d[i] = ring[p]; ring[p] = val; p = nxt;
      }
      ksCache.set(key, buf);
    }
    const src = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), v = voice(0.42 * vel, 0.3);
    lp.type = 'lowpass'; lp.frequency.value = 1900;
    src.buffer = buf; src.connect(lp); lp.connect(v); src.start(t);
  }

  // Church bell: the classic inharmonic partials (hum, prime, tierce, quint, nominal...), long ring.
  function bell(f, t, vel = 1) {
    const v = voice(0.2 * vel, 0.8);
    [[0.5, 0.6, 7], [1, 0.8, 5], [1.183, 0.5, 3.5], [1.506, 0.35, 3], [2, 0.6, 2.6], [2.514, 0.25, 1.8], [2.662, 0.2, 1.6], [3.011, 0.15, 1.2], [4.166, 0.08, 0.8]]
      .forEach(([r, a, d]) => partial(v, f * r, t, a, 0.003, d));
  }

  // Soft organ: sine + octave + twelfth with a slow swell (hymn chords).
  function organ(freqs, t, len) {
    const v = voice(0.11, 0.7);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.connect(v);
    for (const f of freqs) for (const [r, a] of [[1, 1], [2, 0.32], [3, 0.12]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(a / freqs.length, t + 0.6);
      g.gain.setValueAtTime(a / freqs.length, t + len - 0.5);
      g.gain.linearRampToValueAtTime(0.0001, t + len + 0.4);
      o.connect(g); g.connect(lp); o.start(t); o.stop(t + len + 0.5);
    }
  }

  // Hand drum: a pitched membrane (sine with a fast pitch drop) plus a slap of filtered noise.
  function drum(f, t, vel = 1, decay = 0.35) {
    const v = voice(0.55 * vel, 0.2), o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f * 1.9, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g); g.connect(v); o.start(t); o.stop(t + decay + 0.05);
    noise(v, t, 0.04, 1800, 0.35 * vel);
  }

  let _noise;
  function noise(dest, t, len, freq, amp, type = 'bandpass') {
    if (!_noise) { _noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = _noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = _noise; f.type = type; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(f); f.connect(g); g.connect(dest); src.start(t, Math.random() * 0.5); src.stop(t + len + 0.02);
  }
  // Gourd rattle (nseege-style shaker) and a finger snap.
  const rattle = (t, vel = 1) => noise(voice(0.25 * vel, 0.15), t, 0.06, 6500, 0.6, 'highpass');
  const snap = (t, vel = 1) => noise(voice(0.5 * vel, 0.3), t, 0.05, 2600, 1.2);

  // Round electric-style bass: sine + soft square through a lowpass.
  function bass(f, t, len = 0.28, vel = 1) {
    const v = voice(0.35 * vel, 0.05), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(v);
    partial(lp, f, t, 0.9, 0.005, len);
    partial(lp, f, t, 0.15, 0.005, len * 0.7, 'square');
  }

  /* ---------------- arrangements: (step, time) -> schedule notes; return seconds per step ---------------- */
  // Amadinda-style: five-note, roughly equal-step scale; two interlocking parts alternate on every pulse,
  // with a low "okukoonera"-style doubling where the parts meet. Original patterns.
  const AMA = (i) => 196 * Math.pow(2, i / 5);
  const PART_A = [0, 2, 4, 2, 5, 3, 1, 3, 0, 2, 4, 6];
  const PART_B = [7, 5, 3, 6, 4, 2, 7, 5, 8, 6, 3, 5];
  const arr = {
    amadinda(s, t) {
      const i = s % 24, half = i >> 1;
      const note = i % 2 === 0 ? PART_A[half] : PART_B[half];
      log(AMA(note), t, i % 2 === 0 ? 0.95 : 0.8);
      if (note <= 2 && i % 4 === 0) log(AMA(note) / 2, t, 0.5);
      return 0.19;
    },
    guitar(s, t) {
      const chords = [[48, 55, 64, 67], [43, 55, 62, 67], [45, 57, 64, 69], [41, 53, 60, 65]]; // C G Am F
      const c = chords[Math.floor(s / 8) % 4], pat = [0, 1, 3, 2, 1, 3, 2, 1];
      guitar(midi(c[pat[s % 8]] + (pat[s % 8] === 0 ? 0 : 12)), t, s % 8 === 0 ? 1 : 0.7);
      return 0.34;
    },
    piano(s, t) {
      // 3/4 lullaby: bass on 1, soft chord on 2 and 3, a slow melody note at the top of each bar.
      const prog = [[53, 57, 60], [48, 55, 64], [50, 57, 62], [46, 53, 62], [53, 57, 65], [48, 52, 64], [46, 50, 65], [48, 55, 64]];
      const mel = [72, 69, 74, 70, 72, 67, 69, 67];
      const bar = Math.floor(s / 3) % prog.length, beat = s % 3, c = prog[bar];
      if (beat === 0) { piano(midi(c[0] - 12), t, 0.8, 3); piano(midi(mel[bar]), t + 0.02, 0.55, 3.2); }
      else piano(midi(c[beat]), t, 0.35, 1.6);
      return 0.62;
    },
    hymn(s, t) {
      const prog = [[53, 57, 60, 65], [46, 58, 62, 65], [53, 57, 60, 65], [48, 55, 60, 64], [50, 57, 62, 65], [46, 53, 62, 65], [48, 55, 64, 67], [53, 57, 60, 65]];
      organ(prog[s % prog.length].map(midi), t, 3.6);
      if (s % 4 === 0) bell(midi(53), t + 0.4, 0.6);
      return 3.6;
    },
    baganda(s, t) {
      // Amadinda-style interlocking parts over drums and a gourd rattle (12-pulse cycle).
      const i = s % 24, half = i >> 1;
      log(AMA(i % 2 === 0 ? PART_A[half] : PART_B[half]), t, i % 2 === 0 ? 0.8 : 0.65);
      const p = s % 12;
      if (p === 0 || p === 7) drum(70, t, 1, 0.5);           // big drum
      if (p === 3 || p === 5 || p === 9 || p === 11) drum(190, t, 0.55, 0.18); // small drum
      if (p % 2 === 1) rattle(t, 0.7);
      return 0.17;
    },
    groove(s, t) {
      // An original mid-tempo groove: bass line, kick, soft hat and finger snaps on 2 and 4.
      const i = s % 16, line = [40, 0, 40, 47, 0, 45, 0, 43, 40, 0, 40, 47, 0, 50, 0, 47];
      if (line[i]) bass(midi(line[i]), t, 0.22);
      if (i === 0 || i === 8 || i === 10) drum(55, t, 0.9, 0.3);
      if (i === 4 || i === 12) snap(t, 1);
      if (i % 2 === 0) noise(voice(0.12, 0.05), t, 0.03, 9000, 0.5, 'highpass');
      if (i === 0 && Math.floor(s / 16) % 2 === 0) piano(midi(64), t, 0.25, 1.4);
      return 0.15;
    },
    bells(s, t) {
      // Ringing "rounds" on six bells (high to low), a pause, and a hymn chord underneath.
      const rounds = [77, 76, 74, 72, 71, 69], i = s % 10;
      if (i < 6) bell(midi(rounds[i]) / 2, t, 0.8);
      if (i === 0) organ([53, 57, 60].map(midi), t, 5.2);
      return i < 6 ? 0.55 : 0.75;
    },
  };

  function tick() {
    if (!ctx || !style) return;
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      const dt = arr[style](step++, nextTime);
      nextTime += dt;
    }
  }

  return {
    styles: Object.keys(arr),
    /** Start (or switch) the score. audioCtx must already be unlocked by a user gesture. */
    play(audioCtx, name) {
      init(audioCtx);
      if (!arr[name] || name === style) return;
      style = name; step = 0; nextTime = ctx.currentTime + 0.4;
      wet.gain.setTargetAtTime(name === 'hymn' || name === 'bells' ? 0.9 : 0.45, ctx.currentTime, 0.5);
      if (!timer) timer = setInterval(tick, 90);
    },
    /** 0..1 volume (ducked under narration by the caller). */
    setLevel(v) {
      level = v;
      if (out) out.gain.setTargetAtTime(v, ctx.currentTime, 0.6);
    },
    stop() { style = null; if (out) out.gain.setTargetAtTime(0, ctx.currentTime, 0.3); },
    get level() { return level; },
  };
}
