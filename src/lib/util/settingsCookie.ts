export interface SavedSettings {
  inputMode: 'keyboard' | 'midi' | null;
  durationSeconds: string | null;
  durationLength: string | null;
  chordTypes: string[];
  rootNotes: string[];
  learnMode: boolean;
}

const COOKIE_NAME = 'midigym_settings';
const COOKIE_DAYS = 365;

export function saveSettings(settings: SavedSettings): void {
  const json = JSON.stringify(settings);
  const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(json)};expires=${expires};path=/;SameSite=Lax`;
}

export function loadSettings(): SavedSettings | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}
