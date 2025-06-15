// an entire file for flat to sharp...... :()
import { Note } from "tonal";
// Note: this will also replace enharmonics like E## with F# and E# with F.
// Formats a note preferring less accidentals over more and sharps over flats.
export function formatNote(note: string): string {
  note = Note.simplify(note);
  if(note.includes("b")) note = Note.enharmonic(note);
  return note;
}
