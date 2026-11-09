/**
 * Sound Manager for MidiGym
 * Handles loading and playing sounds for piano notes, correct/incorrect feedback, and game completion
 * All sounds played on the site use the function playSound
 *
 * Uses the Web Audio API with pre-decoded AudioBuffers. Starting an AudioBufferSourceNode is
 * effectively instant, unlike cloning/playing an HTMLAudioElement, which spins up a new media
 * pipeline per note and adds very noticeable latency.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// Octaves we have piano samples for. Notes outside this range are pitch-shifted from the nearest one.
const SAMPLE_OCTAVES = [3, 4];
const FEEDBACK_SOUNDS = ['correct', 'incorrect', 'finish'];

let ctx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer>();
const loading = new Map<string, Promise<void>>();

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return null;
  ctx = new AudioContext({ latencyHint: 'interactive' });

  // Browsers start the context suspended until a user gesture. MIDI messages don't count as
  // gestures, so resume on the first click/keypress anywhere on the page.
  const resume = () => {
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
    if (ctx?.state === 'running') {
      window.removeEventListener('pointerdown', resume, true);
      window.removeEventListener('keydown', resume, true);
    }
  };
  window.addEventListener('pointerdown', resume, true);
  window.addEventListener('keydown', resume, true);
  return ctx;
}

function fileFor(key: string): string {
  return `/sounds/${key.replace('#', 'sharp')}.ogg`;
}

function loadSound(key: string): Promise<void> {
  const existing = loading.get(key);
  if (existing) return existing;
  const audio = getContext();
  if (!audio) return Promise.resolve();

  const p = fetch(fileFor(key))
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then(data => audio.decodeAudioData(data))
    .then(buf => { buffers.set(key, buf); })
    .catch(err => console.warn(`Failed to load sound: ${key}`, err));
  loading.set(key, p);
  return p;
}

/**
 * Map a sound key to the sample file that backs it and the playback rate to use.
 * Piano notes outside the sampled octaves reuse the same pitch class from the nearest octave.
 */
function sampleFor(key: string): { sampleKey: string; rate: number } {
  const m = key.match(/^([A-G]#?)(-?\d+)$/);
  if (!m) return { sampleKey: key, rate: 1 };
  const pc = m[1];
  const oct = parseInt(m[2], 10);
  const lo = SAMPLE_OCTAVES[0];
  const hi = SAMPLE_OCTAVES[SAMPLE_OCTAVES.length - 1];
  const nearest = Math.min(hi, Math.max(lo, oct));
  return { sampleKey: `${pc}${nearest}`, rate: Math.pow(2, oct - nearest) };
}

/**
 * Play a sound immediately (or after `delaySeconds`, scheduled on the audio clock).
 * @param key Identifier of the sound to play (e.g., note name like "C#4" or 'correct')
 * @param volume Volume level (0.0 to 1.0)
 * @param delaySeconds Optional offset from now
 */
export function playSound(key: string, volume: number = 0.5, delaySeconds: number = 0): void {
  const audio = getContext();
  if (!audio) return;
  if (audio.state !== 'running') audio.resume().catch(() => {});

  const { sampleKey, rate } = sampleFor(key);
  const buffer = buffers.get(sampleKey);
  if (!buffer) {
    // Not decoded yet - kick off a load so it's ready next time rather than blocking now.
    loadSound(sampleKey);
    return;
  }

  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  const gain = audio.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(audio.destination);
  source.start(audio.currentTime + Math.max(0, delaySeconds));
}

/**
 * Preload all piano sounds and feedback sounds
 */
export function preloadAllSounds(): void {
  for (const octave of SAMPLE_OCTAVES) {
    for (const note of NOTE_NAMES) loadSound(`${note}${octave}`);
  }
  for (const key of FEEDBACK_SOUNDS) loadSound(key);
}
