import { GameState, getInitialState } from "./gacha-system";

const STORAGE_KEY = "endfield-gacha-state";

export function loadGameState(): GameState {
  if (typeof window === "undefined") {
    return getInitialState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with initial state to handle new fields
      return {
        ...getInitialState(),
        ...parsed,
        banners: {
          ...getInitialState().banners,
          ...(parsed.banners || {}),
        },
        stats: {
          ...getInitialState().stats,
          ...(parsed.stats || {}),
        },
        limitedBonuses: {
          ...getInitialState().limitedBonuses,
          ...(parsed.limitedBonuses || {}),
        },
      };
    }
  } catch (error) {
    console.error("Failed to load game state:", error);
  }

  return getInitialState();
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save game state:", error);
  }
}

export function clearGameState(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear game state:", error);
  }
}

