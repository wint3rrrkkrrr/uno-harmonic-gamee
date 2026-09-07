import { GameState } from '../types/game';

const STORAGE_KEY = 'harmonic_card_game_saved_state';

export function saveGameState(state: GameState): boolean {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save game state to localStorage', err);
    return false;
  }
}

export function loadSavedGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // basic sanity check
    if (parsed && Array.isArray(parsed.players) && parsed.players.length >= 2) {
      return parsed as GameState;
    }
    return null;
  } catch (err) {
    console.error('Failed to load game state from localStorage', err);
    return null;
  }
}

export function clearSavedGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear game state', err);
  }
}
