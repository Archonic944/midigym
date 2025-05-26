import { writable } from 'svelte/store';

export interface GameSettings {
  durationSeconds: string | null;
  durationLength: string | null;
  chordTypes: string[];
}

const defaultSettings: GameSettings = {
  durationSeconds: null,
  durationLength: null,
  chordTypes: []
};

export const gameSettings = writable<GameSettings>(defaultSettings);
