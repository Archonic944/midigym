<script lang="ts">
  //TODO implement a function that, given a set of notes, determines whether those notes *could* be the target chord eventually
  import { clearCurrentNotes, currentNotes } from "$lib/stores/midiNotes";
  import { onDestroy, createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";

  import { Chord, Note } from "tonal";
  import { replaceFlatsWithSharps } from "../util/flatToSharp";
// Reference to the Piano component instance
let pianoRef: any = null;

  const dispatch = createEventDispatcher();

  export let chords: Array<{ name: string; notes: string[] }> = [];

  let currentIndex = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  // animation triggers
  const echoIdx = writable<number|null>(null);
  const flashError = writable(false);


  // Returns MIDI pitch class (0-11) or throws if note is invalid
  function midiPitchClass(note: string): number {
    const midiValue = Note.midi(note);
    if (midiValue === null) throw new Error(`Invalid note: ${note}`);
    return midiValue % 12;
  }

  // Compare two arrays as sets (ignoring order and duplicates)
  function arraysEqualAsSets(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    const aSet = new Set(a);
    const bSet = new Set(b);
    if (aSet.size !== bSet.size) return false;
    for (const val of aSet) if (!bSet.has(val)) return false;
    return true;
  }

  // listen for note changes
  const unsub = currentNotes.subscribe(notes => {
    const target = chords[currentIndex];
    if (!target){ 
      console.warn("No target chord found at index " + currentIndex); 
      return;
    }

    // Use Chord.detect to identify the played chord
    if (notes.length === 0) return;
    let prunedNotes = sortAndPruneNotes(notes);
    const detected = Chord.detect(notes);
    console.log("DEBUG: notes played:", notes);
    console.log("DEBUG: detected chord(s):", detected);
    console.log("DEBUG: target chord:", target?.name, target?.notes);
    let targetNotes = replaceFlatsWithSharps([...target.notes]);
    
    // Does the pruned notes pattern exist somewhere within the target chord?
    const wrongNote = !targetNotes.join("").includes(prunedNotes.join(""));
    if (targetNotes.length === prunedNotes.length) {
      if(wrongNote){
        incorrectCount++;
        flashError.set(true);
        setTimeout(() => flashError.set(false), 300);
        dispatch('incorrect');
      }else{
        correctCount++;
        setTimeout(() => {
          clearCurrentNotes();
        }, 150);
        dispatch('progress', { correctCount });
        echoIdx.set(currentIndex);
        setTimeout(() => echoIdx.set(null), 600);
        currentIndex++;
        if (currentIndex >= chords.length) {
          dispatch('finished', {});
        }
      }
    }
  });
  onDestroy(unsub);

  /**
 * Sorts an array of note strings by octave and note order, then returns the sorted notes without octave numbers.
 * @param notes Array of note strings (e.g., "C4", "D#5", "A3")
 * @returns Sorted array of note names without octave numbers (e.g., ["C", "D#", "A"])
 */
export function sortAndPruneNotes(notes: string[]): string[] {
  // Define the order of notes within an octave
  const noteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  // Helper to extract note and octave
  function parseNote(note: string) {
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) throw new Error(`Invalid note format: ${note}`);
    return { note: match[1], octave: parseInt(match[2], 10) };
  }

  // Clone and sort
  return [...notes]
    .map(parseNote)
    .sort((a, b) => a.octave - b.octave || noteOrder.indexOf(a.note) - noteOrder.indexOf(b.note))
    .map(n => n.note);
}
</script>

<div class="game-area-container">
  <div class="game-area" class:shake={$flashError}>
    {#each chords as chord, idx}
      <span
        class="chord
               {idx === currentIndex ? 'target' : ''}
               {$echoIdx === idx ? 'correct' : ''}
               {idx === currentIndex && $flashError ? 'incorrect' : ''}
               {idx < currentIndex ? 'before' : ''}
               {idx > currentIndex ? 'after' : ''}"
      >
        {#if idx === currentIndex}
          <span class="cursor"></span>
        {/if}
        {chord.name}
      </span>
    {/each}
    <div class="fade-bottom"></div>
  </div>
</div>

<div class="counters">
  <div>Correct: {correctCount}</div>
  <div>Incorrect: {incorrectCount}</div>
</div>

<style>
  .game-area-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100vw;
    min-height: 5.5em;
    position: relative;
    margin-top: 2.5em;
  }
  .game-area {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    max-width: 90vw;
    min-width: 60vw;
    font-family: monospace;
    font-size: 2rem;
    position: relative;
    justify-content: center;
    align-items: flex-start;
    max-height: 4.5em; /* ~2 lines */
    overflow: hidden;
    background: transparent;
  }
  .fade-bottom {
    pointer-events: none;
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 1.5em;
    background: linear-gradient(to bottom, rgba(30,30,30,0) 0%, rgba(30,30,30,0.95) 100%);
    z-index: 10;
  }
  .chord {
    position: relative;
    padding: 0.25em 0.7em;
    color: var(--text-color);
    transition: transform 0.2s, color 0.2s, opacity 0.2s;
    border-radius: 0.7em;
    font-weight: 500;
    z-index: 1;
    background: none;
    display: inline-block;
    margin-bottom: 0.2em;
  }
  .chord .cursor {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #444a53;
    border-radius: 0.7em;
    z-index: -1;
    box-shadow: 0 2px 10px 0 rgba(0,0,0,0.12);
    opacity: 0.85;
    transition: background 0.18s;
  }
  .chord.target {
    color: #fff;
    font-weight: bold;
    z-index: 2;
  }
  .chord.correct {
    animation: echo 0.6s ease-out forwards;
    color: #2ecc71;
  }
  .chord.incorrect {
    animation: flash-red 0.3s ease-out;
    color: #e74c3c;
  }
  .chord.before {
    color: #888;
    opacity: 0.45;
    font-weight: 400;
  }
  .chord.after {
    color: #bbb;
    opacity: 0.7;
    font-weight: 400;
  }
  .game-area.shake {
    animation: shake 0.3s ease-out;
  }
  @keyframes echo {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(1.5); }
  }
  @keyframes flash-red {
    from { opacity: 1; }
    to   { opacity: 0.4; }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    25%     { transform: translateX(-4px); }
    75%     { transform: translateX(4px); }
  }
  .counters {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    font-family: monospace;
    color: var(--text-color);
    justify-content: center;
    font-size: 1.1rem;
  }
</style>