<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    midiKeyboards, 
    refreshMidiKeyboards, 
    rootNote, 
    selectedMidiDevice, 
    selectMidiDevice,
    startCalibration,
    endCalibration
  } from '$lib/stores/midiNotes';
  import { get } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let open = false;
  export let onClose: () => void = () => {};
  export let selectedKeyboard: WebMidi.MIDIInput | null = null;
  let selectedIdx: number = 0;
  let awaitingMiddleC = false;
  let detectedNote: string | null = null;
  // Listen for note input when calibrating
  function startMiddleCCalibration() {
    awaitingMiddleC = true;
    detectedNote = null;
    startCalibration((noteIdentifier: string) => {
      if (!awaitingMiddleC) return;
      detectedNote = noteIdentifier;
      if (!detectedNote) return;
      rootNote.set(detectedNote);
      awaitingMiddleC = false;
      setTimeout(() => { detectedNote = null; }, 1200);
      endCalibration();
    });
  }

  function stopMiddleCCalibration() {
    awaitingMiddleC = false;
    endCalibration();
  }

  function handleSelectChange(e: Event) {
    selectedIdx = +(e.target as HTMLSelectElement).value;
    selectMidiDevice(keyboards[selectedIdx]);
  }

  function handleRefresh() {
    refreshMidiKeyboards();
  }

  function handleClose() {
    stopMiddleCCalibration();
    onClose();
  }

  function handleDeviceSelect(device: WebMidi.MIDIInput) {
    selectMidiDevice(device);
  }

  function handleUseKeyboard() {
    dispatch('useKeyboard');
    handleClose();
  }

  $: keyboards = $midiKeyboards;
  $: {
    // When selectedKeyboard changes via props, update the store
    if (selectedKeyboard && selectedKeyboard !== get(selectedMidiDevice)) {
      selectMidiDevice(selectedKeyboard);
    }
    // When store changes, update the local variable
    selectedKeyboard = $selectedMidiDevice;
  }
  $: {
    const deviceIndex = keyboards.findIndex(kb => kb === selectedKeyboard);
    if (deviceIndex >= 0) {
      selectedIdx = deviceIndex;
    }
  }

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
        <label>Calibrate Middle C: <strong>(optional!)</strong></label>
        {#if !awaitingMiddleC}
          <button class="wide-button"
            on:click={startMiddleCCalibration}
            disabled={!selectedKeyboard}
          >Calibrate</button>
        {:else}
          <div class="calibrating">Press middle C...<br/>{#if detectedNote}<span class="detected">{detectedNote}</span>{/if}</div>
        {/if}
      </div>
      <div class="divider"></div>
      <button
        class="wide-hollow-button"
        on:click={handleClose}
        disabled={!selectedKeyboard}
      >Done</button>
      <button
        class="wide-hollow-button"
        style="margin-top:0.5rem"
        on:click={handleUseKeyboard}
      >Use Computer Keyboard</button>
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
.wide-hollow-button[disabled] {
  opacity: 0.5;
  pointer-events: none;
}
</style>
