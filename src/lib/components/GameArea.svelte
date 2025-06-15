<script lang="ts">
  import { clearCurrentNotes, currentNotes } from "$lib/stores/midiNotes";
  import { onDestroy, createEventDispatcher, onMount, tick } from "svelte";
  import { writable } from "svelte/store";
  import { playSound } from "$lib/util/soundManager";
  import { Chord, Note } from "tonal";
  import { formatNote} from "../util/flatToSharp";

  let pianoRef: any = null;
  const dispatch = createEventDispatcher();

  export let chords: Array<{ name: string; notes: string[] }> = [];
  export let learnMode: boolean = false;

  export let currentIndex = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  // animation triggers
  const echoIdx = writable<number | null>(null);
  const flashError = writable(false);

  let gameAreaRef: HTMLElement;
  let hasOverflow = false;

  function updateOverflow() {
    if (gameAreaRef) {
      hasOverflow = gameAreaRef.scrollHeight > gameAreaRef.clientHeight;
    }
  }

  function scrollTargetToTop(idx: number = currentIndex) {
    if (!gameAreaRef) return;

    const el = gameAreaRef.querySelectorAll<HTMLElement>('.chord')[idx];
    if (!el) return;

    // If .game-area has padding-top remove it here, otherwise this line can just be: const y = el.offsetTop;
    const paddingTop = parseFloat(getComputedStyle(gameAreaRef).paddingTop) || 0;
    const y = el.offsetTop - paddingTop;

    gameAreaRef.scrollTo({ top: y, behavior: 'smooth' });
  }

  // listen for note changes
  const unsub = currentNotes.subscribe(async notes => {
    const target = chords[currentIndex];
    if (!target) {
      console.warn("No target chord found at index " + currentIndex);
      return;
    }

    if (notes.length === 0) return;

    // Prune + sort notes (pruning gets rid of octave number)
    let prunedNotes = sortAndPruneNotes(notes);
    let targetNotes = [...target.notes].map(formatNote);

    // Only check for an incorrect chord when the user plays the same amount of notes as the target chord
    const wrongNote = !targetNotes.join("").includes(prunedNotes.join(""));
    if (targetNotes.length === prunedNotes.length) {
      console.log("Target notes: " + targetNotes);
      console.log("Player notes: " + prunedNotes);
      if (wrongNote) {
        incorrectCount++;
        flashError.set(true);
        playSound('incorrect', 0.4);
        setTimeout(() => flashError.set(false), 300);
        dispatch('incorrect');
      } else {
        correctCount++;
        playSound('correct');
        setTimeout(() => {
          clearCurrentNotes();
        }, 150);
        dispatch('progress', { correctCount });
        echoIdx.set(currentIndex);
        setTimeout(() => echoIdx.set(null), 600);

        currentIndex++;
        // After DOM updates, scroll the new target into view
        await tick();
        if (currentIndex < chords.length) {
          scrollTargetToTop();
          {
  const el = gameAreaRef.querySelectorAll<HTMLElement>('.chord')[currentIndex];
  console.log({
    idx: currentIndex,
    offsetTop: el?.offsetTop,
    scrollTop: gameAreaRef.scrollTop,
    clientHeight: gameAreaRef.clientHeight,
    scrollHeight: gameAreaRef.scrollHeight
  });
}
          updateOverflow();
        } else {
          // No more chords - congrats u finished!!
          dispatch('finished', {});
        }
      }
    }
  });
  onDestroy(unsub);

  onMount(() => {
    if (gameAreaRef) {
      gameAreaRef.scrollTo({ top: 0 });
      updateOverflow();
    }
    const resizeObs = new ResizeObserver(() => {
      updateOverflow();
      // Optionally, re-scroll the current target into view on width change:
      if (gameAreaRef && currentIndex < chords.length) {
        const chordElements = gameAreaRef.querySelectorAll<HTMLElement>('.chord');
        const currentEl = chordElements[currentIndex];
        if (currentEl) {
          currentEl.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
      }
    });
    if (gameAreaRef) resizeObs.observe(gameAreaRef);
    window.addEventListener('resize', updateOverflow);
    return () => {
      resizeObs.disconnect();
      window.removeEventListener('resize', updateOverflow);
    };
  });

  /**
   * Sorts an array of note strings by octave and note order, then returns the sorted notes without octave numbers.
   * @param notes Array of note strings (e.g., "C4", "D#5", "A3")
   * @returns Sorted array of note names without octave numbers (e.g., ["C", "D#", "A"])
   */
  export function sortAndPruneNotes(notes: string[]): string[] {
    const noteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    function parseNote(note: string) {
      const match = note.match(/^([A-G]#?)(\d+)$/);
      if (!match) throw new Error(`Invalid note format: ${note}`);
      return { note: match[1], octave: parseInt(match[2], 10) };
    }
    return [...notes]
      .map(parseNote)
      .sort((a, b) => a.octave - b.octave || noteOrder.indexOf(a.note) - noteOrder.indexOf(b.note))
      .map(n => n.note);
  }
</script>

<div class="game-area-container">
  <div class="game-area" bind:this={gameAreaRef}>
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
          <span class="cursor{ $flashError ? ' shake' : '' }"></span>
        {/if}
        {chord.name}
        {#if learnMode && idx === currentIndex}
          <span class="chord-notes">{chord.notes.join(', ')}</span>
        {/if}
      </span>
    {/each}
    {#if hasOverflow}
      <div class="fade-bottom"></div>
    {/if}
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
    min-height: 4.8em; /* Reduced from 5.5em */
    position: relative;
    margin-top: 2em; /* Reduced from 2.5em */
    margin-bottom: 2em; /* Reduced from 2.5em */
  }
  .game-area {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem; /* Reduced from 0.75rem */
    max-width: 95vw; /* Increased from 92vw to use more screen width */
    min-width: 60vw; /* Reduced from 62vw */
    font-family: monospace;
    font-size: 1.8rem; /* Reduced from 2rem */
    position: relative;
    justify-content: center;
    align-items: flex-start;
    height: 5.5em; /* Reduced from 6em */
    overflow-y: auto;
    background: transparent;
    padding: 0.5em 1em;
  }
  
  /* Add media query for smaller screens */
  @media (max-width: 768px) {
    .game-area {
      font-size: 1.6rem;
      gap: 0.55rem;
      height: 5em;
      min-width: 90vw;
    }
    
    .game-area-container {
      min-height: 4.2em;
      margin-top: 1.6em;
      margin-bottom: 1.6em;
    }
  }
  
  .fade-bottom {
    pointer-events: none;
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 3.5em;
    background: linear-gradient(to bottom, rgba(30,30,30,0) 0%, rgba(30,30,30,0.95) 100%);
    z-index: 10;
  }
  .chord {
    position: relative;
    padding: 0.25em 0.6em; /* Reduced right padding from 0.7em */
    color: var(--text-color);
    transition: transform 0.2s, color 0.2s, opacity 0.2s;
    border-radius: 0.7em;
    font-weight: 500;
    z-index: 1;
    background: none;
    display: inline-block;
    margin-bottom: 0.2em;
  }
  
  .chord-notes {
    display: block;
    font-size: 0.65em;
    color: var(--accent-color, #3498db);
    margin-top: 0.2em;
    font-weight: normal;
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
    10%     { transform: translateX(-6px); }
    20%     { transform: translateX(6px); }
    30%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    50%     { transform: translateX(-5px); }
    60%     { transform: translateX(5px); }
    70%     { transform: translateX(-3px); }
    80%     { transform: translateX(3px); }
    90%     { transform: translateX(-1px); }
  }
  .cursor.shake {
    animation: shake 0.45s cubic-bezier(.36,.07,.19,.97) both;
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
