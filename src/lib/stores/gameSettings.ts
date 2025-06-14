import { writable } from 'svelte/store';

export interface GameSettings {
  durationSeconds: string | null;
  durationLength: string | null;
  chordTypes: string[];
  rootNotes: string[];
  learnMode: boolean;
}

const defaultSettings: GameSettings = {
  durationSeconds: null,
  durationLength: null,
  chordTypes: [],
  rootNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  learnMode: false
};

export const gameSettings = writable<GameSettings>(defaultSettings);
