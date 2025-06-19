# Codebase Summary for MidiGym

## General Directives

Rely on existing frameworks and rules as much as possible. Do not create duplicates of something that already exists within the project.

IMPORTANT: When MAJOR CHANGES TO EXISTING FILES are made or NEW FILES ARE CREATED, update the corresponding file description in .github/copilot-instructions.md or add a new file description in the correct category.

## Web Searching

When working through a difficult problem, it is HIGHLY recommended to pull information from the internet. To do this, fetch from DuckDuckGo with the !ducky bang.
An example: https://duckduckgo.com/?q=!ducky+svelte+reactivity

This will take you DIRECTLY to the first article on svelte reactivity. Follow the exact format from the example, including the !ducky and using + for space.
Do not use %2_ for special characters.

## Top-Level Files

- **README.md**: Basic SvelteKit project setup and usage instructions.
- **package.json**: Project metadata, scripts, and dependencies. Uses SvelteKit, Vite, TypeScript, Tonal (music theory), and WebMidi (MIDI input).
- **svelte.config.js**: SvelteKit config, uses auto adapter and Vite preprocessor.
- **vite.config.ts**: Vite config, loads SvelteKit plugin.
- **tsconfig.json**: TypeScript config, extends SvelteKit defaults, strict mode enabled.

## App Shell

- **src/app.html**: Main HTML template for SvelteKit app.
- **src/app.d.ts**: TypeScript global types for SvelteKit.
- **src/lib/index.ts**: Placeholder for `$lib` alias imports.

## Main Page

- **src/routes/+page.svelte**: Main UI and state machine for the app. Handles input (keyboard/MIDI), game settings, game loop, and results. Imports all major components and manages transitions between input, settings, game, and stats screens.

## Components (`src/lib/components/`)

- **Card.svelte**: UI card with title, icon (SVG or emoji), and description. Emits click events.
- **CardPicker.svelte**: Presents 1-4 Card options, handles selection logic.
- **CheckboxPicker.svelte**: Lets user select chord types, grouped by category. Notifies parent on change.
- **GameArea.svelte**: Core game logic. Listens to MIDI/computer keyboard notes, checks against target chords, tracks correct/incorrect answers, and emits progress/finished events. Supports learn mode to display chord notes.
- **LiveStats.svelte**: Displays live statistics above the game area during gameplay. Shows CPM, accuracy, streak, time remaining/elapsed, and chords played. Updates in real-time as the user plays.
- **MidiSetupModal.svelte**: Modal for MIDI device setup and calibration (e.g., setting middle C). Handles MIDI device selection and note detection.
- **MiniPiano.svelte**: Interactive one-octave piano for selecting root notes. Allows multiple note selection with visual feedback.
- **Piano.svelte**: Renders a 24-key piano (C3–B4), highlights pressed notes from currentNotes store.
- **Results.svelte**: Displays game results (CPM, accuracy, correct/incorrect, duration, chord types) and play-again button.
- **RowPicker.svelte**: Horizontal picker for options (e.g., duration), highlights selected, emits onSelect.

## Stores (`src/lib/stores/`)

- **gameSettings.ts**: Svelte store for game settings (duration, chord types, root notes, learn mode, etc.).
- **midiNotes.ts**: Svelte stores for current notes, MIDI keyboards, and MIDI/computer keyboard input logic. Includes helpers for note conversion and event handling.

## Types (`src/lib/types/`)

- **CardOption.ts**: TypeScript interface for Card options (title, icon, description).

## Utilities (`src/lib/util/`)

- **chordCategories.ts**: Centralized definitions of chord categories and types used across the app. Provides interfaces and helper functions for consistent chord categorization.
- **flatToSharp.ts**: Converts flat note names (e.g., Db) to sharps (e.g., C#).
- **generate_chords.ts**: Generates random chord objects based on game settings (chord types and root notes) and chord type mappings using Tonal.

## Utilities (`src/util/`)

- **flatToSharp.ts**: (Empty file, likely unused or placeholder.)

## Tests

- **test_pitch_class.js / test_pitch_class.mjs**: Test scripts for pitch class and chord comparison logic using Tonal.

## Static Assets

- **static/app.css**: Main stylesheet. Contains rules for styling that copilot should follow. Any styling should be added to or derived from this file.
- **static/svgs/**: SVG icons for keyboard and piano.
- **static/favicon.png**: App favicon.