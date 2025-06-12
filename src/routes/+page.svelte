<script lang="ts">
	import MidiSetupModal from '$lib/components/MidiSetupModal.svelte';
    import CardPicker from "$lib/components/CardPicker.svelte";
    import type { CardOption } from "$lib/types/CardOption";
    import Piano from "$lib/components/Piano.svelte";
    import GameArea from "$lib/components/GameArea.svelte";
    import Results from "$lib/components/Results.svelte";

    import { currentNotes, setupMidiAndKeyboard } from "$lib/stores/midiNotes";
    import RowPicker from "$lib/components/RowPicker.svelte";
    import CheckboxPicker from "$lib/components/CheckboxPicker.svelte";
    import { gameSettings } from "$lib/stores/gameSettings";
    import { generateChords } from "$lib/util/generate_chords";
    import { onDestroy } from "svelte";
    import { tick } from "svelte";

    let showMidiModal = false;
    let setupComplete = false;
    let selectedCard: CardOption | null = null;
    let selectedDurationSeconds: string | null = null;
    let selectedDurationLength: string | null = null;
    let selectedChordTypes: string[] = [];
    let chordsList: Array<{ name: string; notes: string[] }> = [];
    let timer = 0;
    let correctCountPage = 0;
    let incorrectCountPage = 0;
    let chordsLeftTotal = 0;
    let timerInterval: ReturnType<typeof setInterval>;
    let gameStartTime: number;
    let gameFinished = false;
    let finishedStats: { cpm: number; accuracy: number; correct: number; incorrect: number; durationSeconds: number | null; durationLength: string | null; chordTypes: string[]; allChordTypes: string[] } | null = null;

    // Track selected MIDI keyboard
    let selectedKeyboard: WebMidi.MIDIInput | null = null;

    // State machine for page: 'input', 'settings', 'game', 'stats'
    type PageState = 'input' | 'settings' | 'game' | 'stats';
    let pageState: PageState = 'input';

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

    // Banner state
    let inputMode: 'keyboard' | 'midi' | null = null;

    // Set input mode when option picked
    function onOptionPicked(card: CardOption, idx: number) {
        selectedCard = card;
        if (card.title === "Computer Keyboard") {
            setupMidiAndKeyboard("keyboard");
            setupComplete = true;
            inputMode = "keyboard";
            pageState = 'settings';
        } else if (card.title === "MIDI Keyboard") {
            setupMidiAndKeyboard("midi");
            // Only show modal if no keyboard is already selected
            if (!selectedKeyboard) {
                showMidiModal = true;
            } else {
                showMidiModal = false;
            }
            inputMode = "midi";
            pageState = 'settings';
        }
    }

    function handleMidiModalClose() {
        showMidiModal = false;
        if (selectedCard && selectedCard.title === "MIDI Keyboard") {
            // Only proceed if a MIDI device was selected (event.detail.selectedIdx is a number)
            setupComplete = true;
            inputMode = "midi";
            pageState = 'settings';
        }
    }

    function goToInputConfig() {
        pageState = 'input';
        showMidiModal = false;
        inputMode = null;
    }

    function openMidiConfig() {
        showMidiModal = true;
    }

    function startGame() {
        finishedStats = null;
        const { durationSeconds, durationLength } = $gameSettings;
        if (durationSeconds) {
            timer = parseInt(durationSeconds);
        }
        if (durationLength) {
            chordsLeftTotal = parseInt(durationLength.slice(1));
        }
        const count = durationLength
            ? chordsLeftTotal
            : 100;
        chordsList = generateChords($gameSettings, count);
        incorrectCountPage = 0;
        correctCountPage = 0;
        gameStartTime = Date.now();
        if (durationSeconds) {
            timerInterval = setInterval(() => {
                timer--;
                if (timer <= 0) clearInterval(timerInterval);
            }, 1000);
        }
        pageState = 'game';
    }

    function handleGameProgress(e) {
        correctCountPage = e.detail.correctCount;
    }

    function handleGameIncorrect() {
        incorrectCountPage++;
    }

    function handleGameFinished() {
        // Calculate stats
        const totalChords = correctCountPage + incorrectCountPage;
        const elapsedMs = Date.now() - gameStartTime;
        const elapsedMin = elapsedMs / 60000;
        const cpm = elapsedMin > 0 ? correctCountPage / elapsedMin : correctCountPage;
        const accuracy = totalChords > 0 ? (correctCountPage / totalChords) * 100 : 100;
        finishedStats = {
            cpm,
            accuracy,
            correct: correctCountPage,
            incorrect: incorrectCountPage,
            durationSeconds: elapsedMs / 1000,
            durationLength: $gameSettings.durationLength,
            chordTypes: $gameSettings.chordTypes,
            allChordTypes: finishedStats?.allChordTypes || [] // unchanged
        };
        pageState = 'stats';
    }

    function playAgain() {
        startGame();
    }

    function handleUseKeyboard() {
        // Use the same index as in the CardPicker cards array (1 for Computer Keyboard)
        onOptionPicked(CardPickerCards[1], 1);
        showMidiModal = false;
    }

    // CardPicker cards array for reuse
    const CardPickerCards: CardOption[] = [
        {
            title: "MIDI Keyboard",
            description:
                "Play by connecting a MIDI keyboard to your computer. WARNING: This feature is only guaranteed to work with Chrome!",
            icon: "/svgs/piano.svg",
        },
        {
            title: "Computer Keyboard",
            description:
                "Play using the keys on your computer keyboard. Can be a little more difficult.",
            icon: "/svgs/keyboard.svg",
        },
    ];

    onDestroy(() => clearInterval(timerInterval));
</script>

<!-- Banner -->
<div class="banner">
    <div class="banner-left">
        {#if inputMode === 'keyboard'}
            <img
                src="/svgs/keyboard.svg"
                alt="Keyboard"
                class="banner-icon"
            />
            <span class="banner-tooltip">using keyboard input</span>
        {:else if inputMode === 'midi'}
            <img
                src="/svgs/piano.svg"
                alt="MIDI Keyboard"
                class="banner-icon"
            />
            <span class="banner-tooltip">using MIDI keyboard</span>
        {/if}
        {#if inputMode}
            <button class="banner-btn" on:click={goToInputConfig}>Input Config</button>
            {#if inputMode === 'midi'}
                <button class="banner-btn less-emph" on:click={openMidiConfig}>Configure MIDI</button>
            {/if}
        {/if}
    </div>
    <div class="banner-center">
        <span class="banner-title">midigym</span>
    </div>
    <div class="banner-right"></div>
</div>

{#if pageState === 'input'}
<h1>MidiGym</h1>
<p>
    Your interactive platform for <strong>learning and practicing</strong> MIDI skills.
</p>
{/if}

{#if pageState === 'input'}
    <div class="centered-picker">
        <CardPicker
            onPick={onOptionPicked}
            cards={CardPickerCards}
        />
    </div>
{:else if pageState === 'settings'}
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
                <button class="wide-button go-button" on:click={startGame}>Go</button>
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
{:else if pageState === 'stats' && finishedStats}
    <Results
        cpm={finishedStats.cpm}
        accuracy={finishedStats.accuracy}
        correct={finishedStats.correct}
        incorrect={finishedStats.incorrect}
        durationSeconds={finishedStats.durationSeconds}
        durationLength={finishedStats.durationLength}
        chordTypes={finishedStats.chordTypes}
        allChordTypes={finishedStats.allChordTypes}
        onPlayAgain={playAgain}
        on:back={() => { pageState = 'settings'; }}
    />
{:else if pageState === 'game'}
    <div class="game-screen">
        {#if $gameSettings.durationSeconds}
            <div class="timer">Time Left: {timer}s</div>
        {:else}
            <div class="timer">Chords Left: {chordsLeftTotal - correctCountPage}</div>
        {/if}
        <GameArea
            chords={chordsList}
            on:progress={handleGameProgress}
            on:incorrect={handleGameIncorrect}
            on:finished={handleGameFinished}
        />
    </div>
{/if}

<!-- Always render the modal, controlled by showMidiModal -->
<MidiSetupModal
    open={showMidiModal}
    onClose={handleMidiModalClose}
    bind:selectedKeyboard
    on:useKeyboard={handleUseKeyboard}
/>

<div class="piano-bottom-center">
    <Piano {currentNotes}  />
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

    .timer {
        text-align: center;
        font-family: monospace;
        color: var(--accent-color);
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }

    .notes-list {
        margin-top: 1.2rem;
        font-size: 1.1rem;
    }

    .banner {
        width: 100vw;
        min-height: 38px;
        background: var(--black, #111);
        color: var(--text-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1003;
        font-size: 1.05rem;
        border-bottom: 1.5px solid #222;
        box-shadow: 0 2px 12px rgba(0,0,0,0.10);
        padding: 0.2rem 0;
        letter-spacing: 0.04em;
    }
    .banner-left, .banner-center, .banner-right {
        display: flex;
        align-items: center;
        height: 100%;
    }
    .banner-left {
        position: absolute;
        left: 1.5rem;
        top: 0;
        height: 100%;
        gap: 0.7rem;
    }
    .banner-center {
        flex: 1;
        justify-content: center;
    }
    .banner-title {
        font-family: monospace;
        font-size: 1.25rem;
        font-weight: 600;
        color: #fff;
        letter-spacing: 0.12em;
        text-transform: lowercase;
        opacity: 0.93;
    }
    .banner-icon {
        width: 1.5em;
        height: 1.5em;
        vertical-align: middle;
        margin-right: 0.2em;
        filter: brightness(0) invert(1); /* Make SVGs white */
        cursor: pointer;
        transition: filter 0.15s;
        color: white;
    }
    .banner-icon:hover {
        filter: brightness(0) invert(1) brightness(1.5);
    }
    .banner-btn {
        margin-left: 0.5em;
        padding: 0.18em 0.95em;
        font-size: 0.97em;
        border-radius: 0.5em;
        border: none;
        background: var(--header-color, #2196f3);
        color: #fff;
        font-family: monospace;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
    }
    .banner-btn:hover {
        background: #1976d2;
    }
    .banner-btn.less-emph {
        background: #222;
        color: #aaa;
        border: 1px solid #444;
        font-weight: 400;
        margin-left: 0.4em;
        font-size: 0.93em;
        opacity: 0.85;
    }
    .banner-btn.less-emph:hover {
        background: #333;
        color: #fff;
        border-color: #2196f3;
    }
    .banner-tooltip {
        font-size: 0.92em;
        color: #aaa;
        margin-left: 0.2em;
        opacity: 0.85;
        pointer-events: none;
        user-select: none;
    }
</style>