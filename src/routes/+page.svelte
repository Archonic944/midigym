<script lang="ts">
    import CardPicker from "$lib/components/CardPicker.svelte";
    import MidiSetupModal from "$lib/components/MidiSetupModal.svelte";
    import type { CardOption } from "$lib/types/CardOption";
    import Piano from "$lib/components/Piano.svelte";

    import { currentNotes, setupMidiAndKeyboard } from "$lib/stores/midiNotes";
    import RowPicker from "$lib/components/RowPicker.svelte";
    import CheckboxPicker from "$lib/components/CheckboxPicker.svelte";
    import { gameSettings } from "$lib/stores/gameSettings";

    let showMidiModal = false;
    let setupComplete = false;
    let selectedCard: CardOption | null = null;
    let selectedDurationSeconds: string | null = null;
    let selectedDurationLength: string | null = null;
    let selectedChordTypes: string[] = [];

    // Handle mutual exclusivity for duration options
    function handleSecondsSelection(option: string) {
        selectedDurationSeconds = option;
        selectedDurationLength = null;
    }

    function handleLengthSelection(option: string) {
        selectedDurationLength = option;
        selectedDurationSeconds = null;
    }

    function handleChordTypesChange(selected: string[]) {
        selectedChordTypes = selected;
    }

    // Sync game settings store with duration and chord types
    $: gameSettings.set({
        durationSeconds: selectedDurationSeconds,
        durationLength: selectedDurationLength,
        chordTypes: selectedChordTypes
    });

    function onOptionPicked(card: CardOption, idx: number) {
        selectedCard = card;
        if (card.title === "Computer Keyboard") {
            setupMidiAndKeyboard("keyboard");
            setupComplete = true;
        } else if (card.title === "MIDI Keyboard") {
            setupMidiAndKeyboard("midi");
            showMidiModal = true;
        }
    }

    function handleMidiModalClose() {
        showMidiModal = false;
        if (selectedCard && selectedCard.title === "MIDI Keyboard") {
            setupComplete = true;
        }
    }
</script>

<h1>MidiGym</h1>
<p>
    Your interactive platform for <strong>learning and practicing</strong> MIDI skills.
</p>

{#if !setupComplete}
    <div class="centered-picker">
        <CardPicker
            onPick={onOptionPicked}
            cards={[
                {
                    title: "MIDI Keyboard",
                    description:
                        "Play by connecting a MIDI keyboard to your computer. WARNING: This feature is only guaranteed to work with Chrome!",
                    icon: "%sveltekit.assets%/svgs/piano.svg",
                },
                {
                    title: "Computer Keyboard",
                    description:
                        "Play using the keys on your computer keyboard. Can be a little more difficult.",
                    icon: "%sveltekit.assets%/svgs/keyboard.svg",
                },
            ]}
        />
        <MidiSetupModal open={showMidiModal} onClose={handleMidiModalClose} />
    </div>
{:else}
    <div class="main-layout">

        <div class="notes-list-debug">
            Notes: <br />
            {#each $currentNotes as note}
                {note}
            {/each}
        </div>
        <div class="content-boxes">
            <div class="content-box duration-box">
                <h3>Duration</h3>
                <div class="duration-subsection">
                    <h4>Seconds</h4>
                    <RowPicker
                        selectedOption={selectedDurationSeconds}
                        options={["30s", "60s", "90s", "120s"]}
                        onSelect={handleSecondsSelection}
                    />
                </div>
                <div class="duration-subsection">
                    <h4>Length</h4>
                    <RowPicker
                        selectedOption={selectedDurationLength}
                        options={["x10", "x15", "x30", "x60"]}
                        onSelect={handleLengthSelection}
                    />
                </div>
                <button class="wide-button go-button">Go</button>
            </div>
            
            <div class="content-box chord-types-box">
                <h3>Chord Types</h3>
                <CheckboxPicker
                    selectedOptions={selectedChordTypes}
                    onSelectionChange={handleChordTypesChange}
                />
            </div>
        </div>
    </div>
{/if}
<div class="piano-bottom-center">
    <Piano {currentNotes} />
</div>

<style>
    .centered-picker {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
    }
    .main-layout {
        position: relative;
        width: 100vw;
        height: 80vh;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: center;
        gap: 0;
        padding-top: 10vh;
    }


    .piano-bottom-center {
        position: absolute;
        left: 50%;
        bottom: 2vh;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 1;
    }

    .notes-list-debug {
        position: fixed;
        top: 1.5rem;
        right: 2.5rem;
        background: rgba(30, 30, 30, 0.95);
        color: var(--text-color);
        border: 2px solid var(--header-color);
        border-radius: 0.7rem;
        padding: 0.7rem 1.2rem;
        font-size: 1.1rem;
        z-index: 1002;
        min-width: 120px;
        font-family: monospace;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    }

    .content-boxes {
        display: flex;
        gap: 24px;
        z-index: 1;
    }

    .content-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid #444;
        border-radius: 12px;
        padding: 24px;
        gap: 20px;
    }

    .duration-box {
        min-width: 300px;
        max-width: 400px;
    }

    .chord-types-box {
        min-width: 400px;
        max-width: 500px;
    }

    .content-box h3 {
        color: var(--header-color);
        text-align: center;
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        text-transform: uppercase;
        width: 100%;
    }

    .duration-subsection {
        margin-bottom: 16px;
    }

    .duration-subsection:last-child {
        margin-bottom: 0;
    }

    .duration-subsection h4 {
        color: var(--accent-color);
        text-align: center;
        margin: 0 0 8px 0;
        font-size: 0.9rem;
        text-transform: uppercase;
        font-weight: normal;
    }

    .go-button {
        margin-top: 16px;
        width: 100%;
    }


    .notes-list {
        margin-top: 1.2rem;
        font-size: 1.1rem;
    }

</style>
