import { writable, get } from 'svelte/store';
import { WebMidi, type Input, type NoteMessageEvent } from 'webmidi';

// Store for currently playing notes (array of note names, e.g., ["C4", "E4"])
export const currentNotes = writable<string[]>([]);

// Store for available MIDI keyboards
export const midiKeyboards = writable<Input[]>([]);

// Store for user-defined MIDI root note (e.g., Middle C)
export const rootNote = writable<string>('C4');

// Store for the currently selected MIDI device
export const selectedMidiDevice = writable<Input | null>(null);

// Internal set to track active notes
const activeNotes = new Set<string>();

// Flag to track if calibration mode is active
let isCalibrationMode = false;
let calibrationCallback: ((note: string) => void) | null = null;

// Utility: Safely clear all currently playing notes (from anywhere)
export function clearCurrentNotes() {
  activeNotes.clear();
  currentNotes.set([]);
}

// Map of computer keyboard keys to MIDI note names (starting at C3)
const keyToNote: Record<string, string> = {
  // Bottom row
  z: "C3", s: "C#3", x: "D3", d: "D#3", c: "E3", v: "F3", g: "F#3", b: "G3", h: "G#3", n: "A3", j: "A#3", m: "B3",
  // Top row
  q: "C4", '2': "C#4", w: "D4", '3': "D#4", e: "E4", r: "F4", '5': "F#4", t: "G4", '6': "G#4", y: "A4", '7': "A#4", u: "B4",
  i: "C5", '9': "C#5", o: "D5", '0': "D#5", p: "E5"
}

export const keyboardToNoteMap = keyToNote;

// --- MIDI note adjustment logic ---
// Helper: MIDI note name to MIDI number (C4 = 60)
function noteNameToMidiNumber(note: string): number {
  const match = note.match(/^([A-Ga-g])([#b]?)(\d)$/);
  if (!match) return 60; // fallback to C4
  const [, letter, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const baseMap = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const base = baseMap[letter.toUpperCase() as keyof typeof baseMap];
  if (base === undefined) return 60; // fallback to C4 if letter is invalid
  let n = base + (octave + 1) * 12;
  if (accidental === '#') n += 1;
  if (accidental === 'b') n -= 1;
  return n;
}

// Helper: MIDI number to note name (e.g. 60 -> C4)
function midiNumberToNoteName(num: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = notes[num % 12];
  const octave = Math.floor(num / 12) - 1;
  return `${note}${octave}`;
}

const STANDARD_MIDDLE_C = 60;
function adjustNoteIdentifier(noteIdentifier: string): string {
  const userRoot = get(rootNote);
  const userRootNum = noteNameToMidiNumber(userRoot);
  const offset = STANDARD_MIDDLE_C - userRootNum;
  if (offset === 0) return noteIdentifier;
  const midiNum = noteNameToMidiNumber(noteIdentifier);
  return midiNumberToNoteName(midiNum + offset);
}

function handleNoteOn(e: NoteMessageEvent) {
  const adjNote = adjustNoteIdentifier(e.note.identifier);
  
  // If in calibration mode, pass the note to the callback and return
  if (isCalibrationMode && calibrationCallback) {
    calibrationCallback(e.note.identifier);
    return;
  }
  
  activeNotes.add(adjNote);
  currentNotes.set(Array.from(activeNotes));
}

function handleNoteOff(e: NoteMessageEvent) {
  const adjNote = adjustNoteIdentifier(e.note.identifier);
  activeNotes.delete(adjNote);
  currentNotes.set(Array.from(activeNotes));
}

function handleKeyDown(event: KeyboardEvent) {
  const note = keyToNote[event.key];
  if (note && !activeNotes.has(note)) {
    // If in calibration mode, pass the note to the callback and return
    if (isCalibrationMode && calibrationCallback) {
      calibrationCallback(note);
      return;
    }
    
    activeNotes.add(note);
    currentNotes.set(Array.from(activeNotes));
  }
}

function handleKeyUp(event: KeyboardEvent) {
  const note = keyToNote[event.key];
  if (note && activeNotes.has(note)) {
    activeNotes.delete(note);
    currentNotes.set(Array.from(activeNotes));
  }
}

function enableComputerKeyboard() {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }
}

function disableComputerKeyboard() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  }
}

// Disconnect all existing MIDI inputs
function disconnectAllMidiInputs() {
  WebMidi.inputs.forEach((input: Input) => {
    input.removeListener("noteon", handleNoteOn);
    input.removeListener("noteoff", handleNoteOff);
  });
}

// Get a list of all potential MIDI keyboards
export function getMidiKeyboards(): Input[] {
  return WebMidi.inputs;
}

// Select a specific MIDI device
export function selectMidiDevice(device: Input | null) {
  // Remove listeners from all devices
  disconnectAllMidiInputs();
  
  // Update the selected device store
  selectedMidiDevice.set(device);
  
  // If a device is selected, add listeners to it
  if (device) {
    device.addListener("noteon", handleNoteOn);
    device.addListener("noteoff", handleNoteOff);
    disableComputerKeyboard(); // Switch to MIDI input
  }
}

export function setupMidiAndKeyboard(mode: 'midi' | 'keyboard') {
  if (mode === 'keyboard') {
    // Clear any existing MIDI setup
    disconnectAllMidiInputs();
    selectedMidiDevice.set(null);
    
    // Enable computer keyboard
    disableComputerKeyboard(); // Remove any previous listeners to avoid duplicates
    enableComputerKeyboard();
    return;
  }
  
  WebMidi.enable()
    .then(() => {
      midiKeyboards.set(WebMidi.inputs);
      if (WebMidi.inputs.length === 0) {
        enableComputerKeyboard();
      } else {
        const currentSelectedDevice = get(selectedMidiDevice);
        if (currentSelectedDevice) {
          // If a device is already selected, use it
          selectMidiDevice(currentSelectedDevice);
        } else if (WebMidi.inputs.length > 0) {
          // Otherwise select the first available device
          selectMidiDevice(WebMidi.inputs[0]);
        }
      }
    })
    .catch(err => {
      console.warn("WebMidi could not be enabled:", err);
      enableComputerKeyboard();
    });
}

// Start calibration mode
export function startCalibration(callback: (note: string) => void): void {
  isCalibrationMode = true;
  calibrationCallback = callback;
}

// End calibration mode
export function endCalibration(): void {
  isCalibrationMode = false;
  calibrationCallback = null;
}

// Refresh the list of available MIDI keyboards
export function refreshMidiKeyboards() {
  midiKeyboards.set(WebMidi.inputs);
}
