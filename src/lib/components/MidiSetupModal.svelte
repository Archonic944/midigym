<script lang="ts">
  import { onMount } from 'svelte';
  import { midiKeyboards, refreshMidiKeyboards, rootNote } from '$lib/stores/midiNotes';
  import { get } from 'svelte/store';

  export let open = false;
  export let onClose: () => void = () => {};

  let selectedIdx: number = 0;
  let awaitingMiddleC = false;
  let detectedNote: string | null = null;
  let unsubscribe: (() => void) | null = null;
  let midiListenerAdded = false;

  // Listen for note input when calibrating
  function startMiddleCCalibration() {
    awaitingMiddleC = true;
    detectedNote = null;
    unsubscribe = rootNote.subscribe(() => {}); // dummy to keep store hot
    window.addEventListener('keydown', handleKeyDown);
    // Add MIDI note listener to selected keyboard
    if (selectedKeyboard && !midiListenerAdded) {
      selectedKeyboard.addListener('noteon', midiNoteHandler);
      midiListenerAdded = true;
    }
  }

  function stopMiddleCCalibration() {
    awaitingMiddleC = false;
    if (unsubscribe) unsubscribe();
    window.removeEventListener('keydown', handleKeyDown);
    // Remove MIDI note listener
    if (selectedKeyboard && midiListenerAdded) {
      selectedKeyboard.removeListener('noteon', midiNoteHandler);
      midiListenerAdded = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    // Only allow one note to be set
    if (!awaitingMiddleC) return;
    // Accept any key as a calibration (for MIDI, this would be a MIDI event)
    // For demo, use the key name as the note
    detectedNote = e.key.toUpperCase();
    rootNote.set(detectedNote);
    awaitingMiddleC = false;
    setTimeout(() => { detectedNote = null; }, 1200);
    window.removeEventListener('keydown', handleKeyDown);
  }

  // MIDI note handler for calibration
  function midiNoteHandler(e: any) {
    if (!awaitingMiddleC) return;
    // e.note.identifier is the note name, e.g., "C4"
    detectedNote = e.note.identifier;
    if(!detectedNote) return;
    rootNote.set(detectedNote);
    awaitingMiddleC = false;
    setTimeout(() => { detectedNote = null; }, 1200);
    // Remove listener after first note
    if (selectedKeyboard && midiListenerAdded) {
      selectedKeyboard.removeListener('noteon',midiNoteHandler);
      midiListenerAdded = false;
    }
  }

  function handleSelectChange(e: Event) {
    // Remove MIDI listener from previous keyboard if needed
    if (selectedKeyboard && midiListenerAdded) {
      selectedKeyboard.removeListener('noteon',midiNoteHandler);
      midiListenerAdded = false;
    }
    selectedIdx = +(e.target as HTMLSelectElement).value;
  }

  function handleRefresh() {
    refreshMidiKeyboards();
  }

  function handleClose() {
    stopMiddleCCalibration();
    onClose();
  }

  $: keyboards = $midiKeyboards;
  $: selectedKeyboard = keyboards[selectedIdx];

  onMount(() => {
    refreshMidiKeyboards();
  });
</script>

{#if open}
  <div class="modal-bg" on:click={handleClose} tabindex="-1">
    <div class="modal midi-modal" on:click|stopPropagation>
      <h2>MIDI Setup</h2>
      <label for="midi-select">Choose MIDI Keyboard:</label>
      <div class="midi-select-row">
        <select id="midi-select" bind:value={selectedIdx} on:change={handleSelectChange}>
          {#each keyboards as kb, i}
            <option value={i}>{kb.name}</option>
          {/each}
        </select>
        <button class="small-button-hollow" on:click={handleRefresh} title="Refresh MIDI devices">⟳</button>
      </div>
      <div class="divider"></div>
      <div class="calibration-section">
        <label>Calibrate Middle C:</label>
        {#if !awaitingMiddleC}
          <button class="wide-button" on:click={startMiddleCCalibration}>Press Middle C</button>
        {:else}
          <div class="calibrating">Waiting for input...<br/>{#if detectedNote}<span class="detected">{detectedNote}</span>{/if}</div>
        {/if}
      </div>
      <div class="divider"></div>
      <button class="wide-hollow-button" on:click={() => {alert("closed"); handleClose();}}>Done</button>
    </div>
  </div>
{/if}

<style>
.modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: var(--background-color);
  color: var(--text-color);
  border-radius: 1.5rem;
  box-shadow: 0 6px 32px rgba(0,0,0,0.25);
  border: 4px solid #fff;
  padding: 2.5rem 2.2rem 2rem 2.2rem;
  min-width: 340px;
  max-width: 95vw;
  min-height: 320px;
  font-family: monospace;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.2rem;
}
.midi-modal h2 {
  color: var(--header-color);
  margin-top: 0;
  margin-bottom: 1.2rem;
  font-size: 1.6rem;
  text-align: center;
}
.midi-select-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.7rem;
}
select#midi-select {
  font-size: 1.1rem;
  padding: 0.4rem 1.2rem 0.4rem 0.7rem;
  border-radius: 8px;
  border: 2px solid var(--header-color);
  background: #111;
  color: var(--text-color);
  font-family: monospace;
}
.divider {
  border-bottom: 2px solid #444;
  margin: 1.1rem 0 0.7rem 0;
}
.calibration-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}
.calibrating {
  color: var(--accent-color);
  font-size: 1.2rem;
  text-align: center;
  margin-top: 0.5rem;
}
.detected {
  color: var(--header-color);
  font-weight: bold;
  font-size: 1.3rem;
  margin-top: 0.3rem;
  display: block;
}
</style>
