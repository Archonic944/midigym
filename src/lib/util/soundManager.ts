/**
 * Sound Manager for MidiGym
 * Handles loading and playing sounds for piano notes, correct/incorrect feedback, and game completion
 * All sounds played on the site use the function playSound
 */

// Cache for preloaded sounds
const soundCache: Record<string, HTMLAudioElement> = {};

/**
 * Preload a sound file into the cache
 * @param key Identifier for the sound
 * @param path Path to the sound file
 */
function preloadSound(key: string, path: string): void {
  if (!soundCache[key]) {
    console.log("preloading sound " + path);
    const audio = new Audio(path);
    audio.load(); // Preload the audio
    soundCache[key] = audio;
  }
}

/**
 * Play a sound from cache or load and play it
 * @param key Identifier of the sound to play (e.g., note name or 'correct')
 * @param volume Volume level (0.0 to 1.0)
 */
export function playSound(key: string, volume: number = 0.5): void {
  // If we haven't loaded this sound yet, load it now
  if (!soundCache[key]) {
    const path = `/sounds/${key}.ogg`
    preloadSound(key, path);
  }
  
  const sound = soundCache[key].cloneNode() as HTMLAudioElement;
  sound.volume = volume;
  sound.play().catch(err => {
    console.warn(`Failed to play sound: ${key}`, err);
  });
}

/**
 * Preload all piano sounds and feedback sounds
 */
export function preloadAllSounds(): void {
  // Piano notes (C3 to B4)
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octaves = [3, 4];
  
  for (const octave of octaves) {
    for (const note of notes) {
      const key = `${note}${octave}`;
      preloadSound(key, `/sounds/${key.replace("#", "sharp")}.ogg`);
    }
  }
  
  // Feedback sounds
  preloadSound('correct', '/sounds/correct.ogg');
  preloadSound('incorrect', '/sounds/incorrect.ogg');
  preloadSound('finish', '/sounds/finish.ogg');
}
