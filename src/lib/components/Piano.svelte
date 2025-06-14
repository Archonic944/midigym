<script lang="ts">
  import { keyboardToNoteMap } from '$lib/stores/midiNotes';
  import { reverseMap } from '$lib/util/miscUtil';
  import type { Readable } from 'svelte/store';
  export let currentNotes: Readable<string[]>;
  export let showTooltips: boolean = false;
  export let learningNotes: string[] = []; // Highlights a key

  console.log("aaaa");
  // keyColors: 24 items, in keyboard order: W B W B W W B W B W B W W B W B W W B W B W B W
  let keyColors: (string | null)[] = Array(24).fill(null);

  // Map: for each key index, is it black? (C3 to B4, 24 keys)
  const isBlack = [
    false, true,  false, true,  false, false, true,  false, true,  false, true,  false, // C3–B3
    false, true,  false, true,  false, false, true,  false, true,  false, true,  false  // C4–B4
  ];

  // For rendering, get white and black key indices and their positions
  let whiteKeyIndices: number[] = [];
  let blackKeyIndices: { idx: number, afterWhite: number }[] = [];
  let whiteCount = 0;
  for (let i = 0; i < 24; i++) {
    if (!isBlack[i]) {
      whiteKeyIndices.push(i);
      whiteCount++;
    } else {
      // Find which white key this black key is after
      let afterWhite = whiteCount - 1;
      blackKeyIndices.push({ idx: i, afterWhite });
    }
  }

  $: {
    console.log(learningNotes + " are learning notes");
  }

  console.log("aaa")

  // Map note names to piano key indices (C3 to B4, 24 keys)
  const noteToIndex: Record<string, number> = {
    'C3': 0,  'C#3': 1,  'D3': 2,  'D#3': 3,  'E3': 4,  'F3': 5,  'F#3': 6,  'G3': 7,  'G#3': 8,  'A3': 9,  'A#3': 10, 'B3': 11,
    'C4': 12, 'C#4': 13, 'D4': 14, 'D#4': 15, 'E4': 16, 'F4': 17, 'F#4': 18, 'G4': 19, 'G#4': 20, 'A4': 21, 'A#4': 22, 'B4': 23
  };

  const indexToNote: Record<number, string> = reverseMap(noteToIndex);

  const noteToKey: Record<string, string> = reverseMap(keyboardToNoteMap);

  console.log(Object.entries(indexToNote));
  console.log(Object.entries(noteToKey));

  // Function to check if a note is in the learning set
  function isLearningKey(index: number): boolean {
    const note = indexToNote[index];
    return learningNotes.includes(note);
  }

  // Update keyColors whenever currentNotes changes
  $: {
    keyColors = Array(24).fill(null);
    console.log($currentNotes);
    for (const note of $currentNotes) {
      const idx = noteToIndex[note];
      if (typeof idx === 'number') {
        keyColors[idx] = isBlack[idx]
          ? 'var(--accent-color-clear)'
          : 'var(--header-color-clear)';
      }
    }
  }
</script>

<div class="piano">
  <div class="white-keys">
    {#each whiteKeyIndices as i}
      <div
        class="white-key {isLearningKey(i) ? 'learning-key' : ''}"
        style="
          border-color: {keyColors[i] || 'white'};
          box-shadow: {keyColors[i] ? `0 0 16px 2px ${keyColors[i]}` : 'none'};
          background: {keyColors[i] ? keyColors[i] : 'none'};
        "
      >
        {#if isLearningKey(i)}
          <span class="learning-outline"></span>
        {/if}
        {#if showTooltips}<span class="tooltip-bottom">{noteToKey[indexToNote[i]]}</span>{/if}
      </div>
    {/each}
  </div>
  <div class="black-keys">
    {#each blackKeyIndices as { idx, afterWhite } }
      <div
        class="black-key {isLearningKey(idx) ? 'learning-key' : ''}"
        style="
          left: calc((100% / {whiteKeyIndices.length}) * ({afterWhite} + 1));
          border-color: {keyColors[idx] || 'white'};
          box-shadow: {keyColors[idx] ? `0 0 16px 2px ${keyColors[idx]}` : 'none'};
          background: {keyColors[idx] ? keyColors[idx] : 'var(--background-color)'};
          transform: translateX(-50%);
        "
      >
        {#if isLearningKey(idx)}
          <span class="learning-outline"></span>
        {/if}
        {#if showTooltips}
        <span class="tooltip-top">{noteToKey[indexToNote[idx]]}</span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
.piano {
  position: relative;
  width: min(560px, 94vw);
  height: 140px;
  margin: 1.5rem auto;
  background: none;
  border-radius: 1.5rem;
  box-shadow: 0 6px 32px rgba(0,0,0,0.25);
  border: 3px solid #fff;
  overflow: hidden;
  user-select: none;
}

@media (max-width: 768px) {
  .piano {
    height: 120px;
    margin: 1.2rem auto;
  }
}

@media (max-height: 700px) {
  .piano {
    height: 110px;
    margin: 1rem auto;
  }
}

.white-keys {
  display: flex;
  height: 100%;
  position: relative;
  z-index: 1;
}
.white-key {
  flex: 1 1 0;
  height: 100%;
  background: none;
  border: 2.5px solid white;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  margin-right: -2px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  justify-items: center;
}
.white-key:last-child {
  margin-right: 0;
}
.black-keys {
  position: absolute;
  top: 0;
  left: 0;
  height: 65%;
  width: 100%;
  z-index: 2;
  pointer-events: none;
}
.black-key {
  position: absolute;
  width: calc(100% / 22);
  height: 100%;
  background: var(--background-color);
  border: 2.5px solid white;
  border-radius: 0 0 6px 6px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-items: center;
}

.white-key.learning-key,
.black-key.learning-key {
  z-index: 3;
  overflow: hidden;
  animation: pulse-glow 1s infinite alternate;
}
.white-key.learning-key {
  position: relative;
}

.learning-outline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 3;
  border: 3px solid;
  border-radius: 4px;
  animation: pulse-colors 1s infinite alternate;
}

/* Black key adjustments */
.black-key .learning-outline {
  opacity: 0.9;
  border-width: 2px;
}

/* Animation for pulsing between colors */
@keyframes pulse-colors {
  0% {
    border-color: var(--learn-color);
    color: var(--learn-color);
  }
  100% {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
}

/* Animation for inner glow */
@keyframes pulse-glow {
  0% {
    box-shadow: inset 0 0 12px var(--learn-color);
  }
  100% {
    box-shadow: inset 0 0 12px var(--accent-color);
  }
}

@keyframes subtle-pulse {
  0% {
    filter: brightness(1);
  }
  100% {
    filter: brightness(1.2);
  }
}

.tooltip-bottom {
  color: lightgray;
  padding: 3px;
  margin-top: auto;
  text-align: center;
  position: relative;
  z-index: 3;
}
.tooltip-top {
  color: lightgray;
  padding: 3px;
  margin-bottom: auto;
  text-align: center;
  position: relative;
  z-index: 3;
}
</style>
