import { Note } from 'tonal';
function midiPitchClass(note) {
  const midiValue = Note.midi(note);
  if (midiValue === null) throw new Error(`Invalid note: ${note}`);
  return midiValue % 12;
}
function arraysEqualAsSets(a, b) {
  if (a.length !== b.length) return false;
  const aSet = new Set(a);
  const bSet = new Set(b);
  if (aSet.size !== bSet.size) return false;
  for (const val of aSet) if (!bSet.has(val)) return false;
  return true;
}
// Test cases
const tests = [
  {target: ['C4','E4','G4'], played: ['C4','E4','G4'], expect: true},
  {target: ['C4','E4','G4'], played: ['E4','G4','C4'], expect: true},
  {target: ['C4','E4','G4'], played: ['C5','E5','G5'], expect: true},
  {target: ['C4','E4','G4'], played: ['C4','G4'], expect: false},
  {target: ['C4','E4','G4'], played: ['C4','E4','G#4'], expect: false},
  {target: ['C4','E4','G#4'], played: ['C4','E4','Ab4'], expect: true},
  {target: ['F4','G#4','C5'], played: ['F4','Ab4','C5'], expect: true},
  {target: ['F4','G#4','C5'], played: ['F4','G#4','C5'], expect: true},
  {target: ['F4','G#4','C5'], played: ['F4','Ab4','C#5'], expect: false},
];
tests.forEach(({target, played, expect}, i) => {
  const targetPcs = target.map(midiPitchClass);
  const playedPcs = played.map(midiPitchClass);
  const result = arraysEqualAsSets(targetPcs, playedPcs);
  console.log(`Test ${i+1}:`, result === expect ? 'PASS' : 'FAIL', '|', 'Target:', target, 'Played:', played, 'Expected:', expect, 'Got:', result);
});
