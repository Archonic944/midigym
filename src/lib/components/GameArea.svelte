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

<div class="game-area" class:shake={$flashError}>
<!-- Make sure Piano is bound correctly in the parent (e.g. +page.svelte):
<Piano bind:this={pianoRef} {currentNotes} />
-->
  {#each chords as chord, idx}
    <span
      class="chord
             {idx === currentIndex ? 'target' : ''}
             {$echoIdx === idx ? 'correct' : ''}
             {idx === currentIndex && $flashError ? 'incorrect' : ''}"
    >
      {chord.name}
      {#if idx === currentIndex}
        <span class="cursor"></span>
      {/if}
    </span>
  {/each}
</div>

<div class="counters">
  <div>Correct: {correctCount}</div>
  <div>Incorrect: {incorrectCount}</div>
</div>

<style>
  .game-area {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    max-height: calc(1.2em * 3 + 0.5rem * 2);
    max-width: 80vw;
    margin: 0 auto;
    font-family: monospace;
    font-size: 1.5rem;
    position: relative;
  }
  .chord {
    position: relative;
    padding: 0.2rem 0.5rem;
    color: var(--text-color);
    transition: transform 0.2s, color 0.2s;
  }
  .cursor {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0.6em;
    background: var(--header-color-clear);
    border-radius: 4px;
  }
  .chord.correct {
    animation: echo 0.6s ease-out forwards;
    color: #2ecc71;
  }
  .chord.incorrect {
    animation: flash-red 0.3s ease-out;
    color: #e74c3c;
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
  }
</style>