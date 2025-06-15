// an entire file for flat to sharp...... :()
// Formats a note preferring less accidentals over more and sharps over flats.

import { Note } from "tonal";

// Note: this will also replace enharmonics like E# with F.
export function formatNote(note: string): string {
  note = Note.simplify(note);
  if(note.includes("b")) note = Note.enharmonic(note);
  return note;
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
  return notes.map(formatNote);
}
