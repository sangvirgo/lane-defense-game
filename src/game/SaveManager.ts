export class SaveManager {
  private static STORAGE_KEY = 'lane-defense-save';

  static save(data: SaveData): void {
    try {
      localStorage.setItem(SaveManager.STORAGE_KEY, JSON.stringify(data));
    } catch (_e) {
      // ignore
    }
  }

  static load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SaveManager.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SaveData;
    } catch (_e) {
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(SaveManager.STORAGE_KEY);
    } catch (_e) {
      // ignore
    }
  }
}

export interface SaveData {
  levelStars: number[];
  highScore: number;
  unlockedPlants: string[];
}
