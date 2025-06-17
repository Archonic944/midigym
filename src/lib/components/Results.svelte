<script lang="ts">
  import { currentNotes } from "$lib/stores/midiNotes";

  export let cpm: number;
  export let accuracy: number;
  export let correct: number;
  export let incorrect: number;
  export let durationSeconds: number | null = null;
  export let durationLength: number | null = null;
  export let chordTypes: string[] = [];
  export let allChordTypes: string[] = [];
  export let onPlayAgain: () => void;
  export let learnMode: boolean = false;
  export let rootNotes: string[] = [];

  import { createEventDispatcher, onDestroy } from "svelte";
  const dispatch = createEventDispatcher();

  // Chord type categories for consolidation
  const chordTypeGroups: Record<string, string[]> = {
    "Major & Minor": ["Major", "Minor"],
    Sus: ["Sus2", "Sus4"],
    Extended: [
      "Maj7",
      "Min7",
      "Dom7",
      "MinMaj7",
      "Maj9",
      "Min9",
      "Dom9",
      "Add9",
    ],
    "Dim & Aug": ["Dim", "Aug", "Dim7", "HalfDim7", "Aug7"],
  };

  // Consolidate chord types into complete categories to save screen space
  function consolidateChordTypes(selected: string[]): string[] {
    const consolidated: string[] = [];
    let used = new Set<string>();
    for (const [label, group] of Object.entries(chordTypeGroups)) {
      if (group.every((type) => selected.includes(type))) {
        consolidated.push(label);
        group.forEach((type) => used.add(type));
      }
    }
    // Add any not covered by groups
    for (const type of selected) {
      if (!used.has(type)) consolidated.push(type);
    }
    return consolidated;
  }

  $: consolidatedChordTypes = consolidateChordTypes(chordTypes);
  $: chordTypeCount = chordTypes.length;
  $: allChordTypeCount = allChordTypes.length;
  let d = currentNotes.subscribe(async notes => {
    let combined = notes.map((note) => {
      return note.replace(/\d+/g, "");
    });
    // Restart by typing GABE on your piano
    if(combined.includes("G") && combined.includes("A") && combined.includes("B") && combined.includes("E") && combined.length === 4){
      onPlayAgain();
    }
  });
  onDestroy(d);
</script>

<div class="results-container">
  <div class="stats-box">
    <h2>Results</h2>
    <div class="cpm-main">{cpm.toFixed(2)} <span>CPM</span></div>
    <div class="accuracy">Accuracy: <span>{accuracy.toFixed(1)}%</span></div>
    <div class="stat-row">
      <div class="stat-label">Correct</div>
      <div class="stat-value">{correct}</div>
    </div>
    <div class="stat-row">
      <div class="stat-label">Incorrect</div>
      <div class="stat-value">{incorrect}</div>
    </div>
    {#if durationSeconds}
      <div class="stat-row">
        <div class="stat-label">Time</div>
        <div class="stat-value">{durationSeconds}s</div>
      </div>
    {/if}
    {#if durationLength}
      <div class="stat-row">
        <div class="stat-label">Chords</div>
        <div class="stat-value">{durationLength}</div>
      </div>
    {/if}
    <button class="play-again" on:click={onPlayAgain}>Play Again</button>
    <button class="secondary-button" on:click={() => dispatch("back")}
      >Back</button
    >
  </div>
  <div class="settings-box">
    <h3>Settings</h3>
    {#if learnMode}
      <div class="setting-row">
        <div class="setting-label">Mode</div>
        <div class="setting-value learn-mode">Learn Mode</div>
      </div>
    {/if}
    <div class="setting-row">
      <div class="setting-label">Chord Types</div>
      <div class="setting-value">
        {#each consolidatedChordTypes as type, i}
          <span class="chord-type"
            >{type}{i < consolidatedChordTypes.length - 1 ? ", " : ""}</span
          >
        {/each}
        <span class="chord-type-count"
          >({chordTypeCount}/{allChordTypeCount})</span
        >
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-label">Root Notes</div>
      <div class="setting-value root-notes">
        {#each rootNotes as note, i}
          <span class="root-note"
            >{note}{i < rootNotes.length - 1 ? ", " : ""}</span
          >
        {/each}
      </div>
    </div>
    {#if durationSeconds}
      <div class="setting-row">
        <div class="setting-label">Duration</div>
        <div class="setting-value">{durationSeconds}s</div>
      </div>
    {/if}
    {#if durationLength}
      <div class="setting-row">
        <div class="setting-label">Chords</div>
        <div class="setting-value">{durationLength}</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .results-container {
    display: flex;
    gap: 2rem; /* Reduced from 2.5rem */
    justify-content: center;
    align-items: flex-start;
    margin: 2rem auto 0 auto; /* Reduced from 3rem */
    max-width: 900px;
    padding: 0 1rem; /* Added padding for smaller screens */
  }
  .stats-box,
  .settings-box {
    background: rgba(255, 255, 255, 0.07);
    border-radius: 1.2rem;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.13);
    padding: 2rem 2rem 1.8rem 2rem; /* Reduced from 2.2rem 2.5rem 2rem 2.5rem */
    min-width: 250px; /* Reduced from 270px */
    font-family: monospace;
    color: var(--text-color);
  }
  .stats-box {
    flex: 1.2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .settings-box {
    flex: 1;
    margin-left: 1.2rem; /* Reduced from 1.5rem */
  }
  .cpm-main {
    font-size: 2.5rem; /* Reduced from 2.7rem */
    font-weight: bold;
    color: #2ecc71;
    margin: 1rem 0 0.6rem 0; /* Reduced from 1.2rem 0 0.7rem 0 */
    display: flex;
    align-items: baseline;
    gap: 0.6rem; /* Reduced from 0.7rem */
  }
  .cpm-main span {
    font-size: 1rem; /* Reduced from 1.1rem */
    color: #aaa;
    font-weight: 400;
  }

  /* Add responsive design for smaller screens */
  @media (max-width: 768px) {
    .results-container {
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .settings-box {
      margin-left: 0;
    }

    .stats-box,
    .settings-box {
      min-width: 220px;
      padding: 1.7rem 1.7rem 1.5rem 1.7rem;
    }
  }

  .accuracy {
    font-size: 1.3rem;
    margin-bottom: 1.2rem;
    color: #2196f3;
  }
  .stat-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 0.3rem 0;
    font-size: 1.1rem;
  }
  .stat-label {
    color: #aaa;
  }
  .stat-value {
    font-weight: bold;
  }
  .play-again {
    margin-top: 2.2rem;
    padding: 0.7rem 2.2rem;
    font-size: 1.2rem;
    border-radius: 0.7rem;
    border: none;
    background: #2ecc71;
    color: #fff;
    font-family: monospace;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.18s;
  }
  .play-again:hover {
    background: #27ae60;
  }
  .secondary-button {
    margin-top: 1.1rem;
    padding: 0.6rem 2rem;
    font-size: 1.05rem;
    border-radius: 0.7rem;
    border: none;
    background: #444;
    color: #fff;
    font-family: monospace;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.18s;
    margin-left: 0.5rem;
    display: block;
  }
  .secondary-button:hover {
    background: #2196f3;
    color: #fff;
  }
  .settings-box h3 {
    margin-top: 0;
    font-size: 1.3rem;
    color: #2196f3;
    margin-bottom: 1.2rem;
  }
  .setting-row {
    margin-bottom: 1.1rem;
  }
  .setting-label {
    color: #aaa;
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }
  .setting-value {
    font-size: 1.1rem;
    color: #fff;
  }
  .chord-type {
    background: #222;
    color: #fff;
    border-radius: 0.5rem;
    padding: 0.1rem 0.7rem;
    margin-right: 0.3rem;
    font-size: 1rem;
    display: inline-block;
  }
  .chord-type-count {
    color: #aaa;
    margin-left: 0.5rem;
    font-size: 0.95rem;
  }
  .learn-mode {
    color: #2196f3;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .root-notes {
    margin-top: 0.1rem;
    font-size: 1.05rem;
    color: #fff;
  }
  .root-note {
    background: #222;
    color: #fff;
    border-radius: 0.5rem;
    padding: 0.1rem 0.7rem;
    margin-right: 0.3rem;
    font-size: 1rem;
    display: inline-block;
  }
</style>
