// ============================================================
// Shared TypeScript types used across screens, hooks, and components.
// ============================================================

/** Визначає поточний режим теми оформлення */
export type ThemeMode = 'dark' | 'light';

/**
 * Ідентифікатор активної звукової теми.
 * Вбудовані: 'classic' | 'digital'
 * Кастомні: UUID рядок (Date.now().toString())
 */
export type SoundTheme = string;

/** Одне коло секундоміра */
export interface LapEntry {
  id: string;
  index: number;
  timeMs: number;
  splitMs: number;
}

/** Вбудована звукова тема (статичний require) */
export interface SoundThemeOption {
  key: string;
  label: string;
  description: string;
  assetPath: number;
  vibrationPattern: number[];
}

/**
 * Кастомний звук, імпортований користувачем.
 * Зберігається у documentDirectory і в AsyncStorage.
 */
export interface CustomSound {
  /** Унікальний ID: Date.now().toString() */
  id: string;
  /** Оригінальна назва файлу (для відображення в UI) */
  name: string;
  /** Абсолютний шлях до скопійованого файлу у documentDirectory */
  uri: string;
}
