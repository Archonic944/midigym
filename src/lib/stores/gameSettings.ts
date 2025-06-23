import { writable } from 'svelte/store';

export interface GameSettings {
  durationSeconds: string | null;
  durationLength: number | null;
  chordTypes: string[];
  rootNotes: string[];
  learnMode: boolean;
  freeInversions: boolean;
  enableInversions: boolean;
}

const defaultSettings: GameSettings = {
  durationSeconds: null,
  durationLength: null,
  chordTypes: [],
  rootNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  learnMode: false,
  freeInversions: false,
  enableInversions: false
};

export const gameSettings = writable<GameSettings>(defaultSettings);
