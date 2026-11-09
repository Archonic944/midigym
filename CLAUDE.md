# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run check` — Type check (svelte-kit sync + svelte-check)
- `npm run check:watch` — Type check with watch mode
- No test framework is configured

## Architecture

MidiGym is a chord symbol typing test app (like MonkeyType but for chords). Users play chords on a MIDI or computer keyboard and are scored on speed (CPM) and accuracy.

**Tech stack:** SvelteKit 2 + Svelte 5, TypeScript, Vite, Tonal.js (music theory), WebMIDI.js

### Game Flow State Machine

`+page.svelte` is the main orchestrator with four pages: `input` → `settings` → `game` → `stats`

### Key Files

- `src/routes/+page.svelte` — Main state machine, timers, statistics, all page rendering
- `src/lib/stores/midiNotes.ts` — MIDI and keyboard input handling, note tracking stores (`currentNotes`, `midiKeyboards`, `rootNote`, `selectedMidiDevice`)
- `src/lib/stores/gameSettings.ts` — Game configuration store (duration, chord types, root notes, learn mode)
- `src/lib/components/GameArea.svelte` — Core game logic: compares pressed notes to target chord (octave-agnostic), dispatches `progress`/`incorrect`/`finished` events
- `src/lib/util/generate_chords.ts` — Random chord generation using Tonal.js; maps chord names to Tonal symbols
- `src/lib/util/soundManager.ts` — Audio caching and playback with preloading
- `src/lib/util/chordCategories.ts` — Chord type definitions in 4 categories (Major/Minor, Sus, Extended, Dim/Aug)

### Input Modes

- **MIDI keyboard:** WebMIDI API with device selection and middle-C calibration
- **Computer keyboard:** Z-row maps to C3-B3, Q-row to C4-B4

### Styling

All styling derives from `static/app.css`. Dark theme with monospace typography. Key colors: header blue (`#689fe8`), accent yellow (`#f9f570`), learn mode green (`#4bdc65`).

## Conventions

- Follow existing naming and architecture patterns
- When modifying or creating files, keep consistent with the established component structure
- Component communication uses Svelte event dispatching
- Notes are normalized from flats to sharps using `flatToSharp.ts`
