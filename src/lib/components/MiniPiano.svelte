<script lang="ts">
  export let selectedNotes: string[] = [];
  
  const keys = [
    { note: 'C', isBlack: false },
    { note: 'C#', isBlack: true },
    { note: 'D', isBlack: false },
    { note: 'D#', isBlack: true },
    { note: 'E', isBlack: false },
    { note: 'F', isBlack: false },
    { note: 'F#', isBlack: true },
    { note: 'G', isBlack: false },
    { note: 'G#', isBlack: true },
    { note: 'A', isBlack: false },
    { note: 'A#', isBlack: true },
    { note: 'B', isBlack: false }
  ];
  
  function toggleNote(note: string) {
    if (selectedNotes.includes(note)) {
      selectedNotes = selectedNotes.filter(n => n !== note);
    } else {
      selectedNotes = [...selectedNotes, note];
    }
  }
</script>

<div class="mini-piano">
  <div class="keyboard">
    {#each keys as { note, isBlack }, i}
      <button
        class="key {isBlack ? 'black' : 'white'} {selectedNotes.includes(note) ? 'selected' : ''}"
        on:click={() => toggleNote(note)}
        aria-label={note}
      ></button>
    {/each}
  </div>
</div>

<style>
  .mini-piano {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  
  .piano-title {
    color: var(--accent-color, #f3e676);
    text-align: center;
    font-size: 1.1rem;
    margin: 0 0 0.6rem 0;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  
  .keyboard {
    height: 5rem;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    display: flex;
    position: relative;
    justify-content: center;
  }
  
  .key {
    height: 100%;
    position: relative;
    transition: all 0.1s;
    cursor: pointer;
    padding: 0;
    outline: none;
  }
  
  .white {
    background-color: var(--background-color);
    width: 30px;
    z-index: 1;
    border: 2px solid #bbb;
    box-sizing: border-box;
    transition: background 0.12s, border-color 0.12s;
    margin: 0 1px;
    border-radius: 0 0 3px 3px;
  }
  .white.selected {
    border-color: var(--accent-color, #f3e676);
    box-shadow: inset 0 0 0 1px var(--accent-color, #f3e676);
  }
  .black {
    background-color: var(--background-color);
    width: 18px;
    height: 65%;
    z-index: 2;
    position: absolute;
    border: 2px solid #444;
    box-sizing: border-box;
    border-radius: 0 0 2px 2px;
    transition: background 0.12s, border-color 0.12s;
  }
  .black.selected {
    border-color: var(--accent-color, #f3e676);
    box-shadow: inset 0 0 0 1px var(--accent-color, #f3e676);
  }
  
  /* Position black keys - shifted one key over */
  .key:nth-child(2) { left: 55px; }  /* C# */
  .key:nth-child(4) { left: 87px; }  /* D# */
  .key:nth-child(7) { left: 151px; }  /* F# */
  .key:nth-child(9) { left: 183px; }  /* G# */
  .key:nth-child(11) { left: 215px; } /* A# */
  
  /* Note labels removed */
  
  .note-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    min-height: 1.8rem;
    font-size: 0.85rem;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .note-list-title {
    font-weight: bold;
    margin-right: 0.4rem;
    color: var(--accent-color, #f3e676);
  }
  
  .note-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: rgba(50, 50, 50, 0.9);
    border-radius: 50%;
    color: #999;
    font-weight: 500;
  }
  
  .note-pill.selected {
    background: var(--accent-color, #f3e676);
    color: #333;
  }
</style>
