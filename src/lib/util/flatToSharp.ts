// Utility to convert flats to sharps
// e.g. Db4 -> C#4, Bb -> A#, etc.
// Note: this will also replace enharmonics like E# with F.
export function flatToSharp(note: string): string {
  // Only handle single accidental (b)
  const match = note.match(/^([A-G])b(\d*)$/);
  if (!match) return note;
  const noteBase = match[1];
  const octave = match[2];
  // Map flats to their enharmonic sharps
  const flatToSharpMap: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };
  const enharmonic = flatToSharpMap[noteBase + 'b'];
  if (!enharmonic) return note;
  return accidentalToNeutral(enharmonic) + octave;
}

/**
 * Takes a pitch class, outputs a pitch class
 * @param pc Pitch class (no octave number) 
 * @returns Corrected pitch class
 */
export function accidentalToNeutral(pc: string): string {
  const accidentalToNeutralMap: Record<string, string> = {
    "Fb": "E",
    "E#": "F",
    "Cb": "B",
    "B#": "C"
  };
  return accidentalToNeutralMap[pc] || pc;
}

// Convert an array of notes, replacing flats with sharps
export function replaceFlatsWithSharps(notes: string[]): string[] {
  return notes.map(flatToSharp);
}
