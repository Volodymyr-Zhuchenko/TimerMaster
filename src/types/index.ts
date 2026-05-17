// ============================================================
// Shared TypeScript types used across screens, hooks, and components.
// Centralizing types here prevents circular imports and makes
// refactoring straightforward — one place to change, everywhere updated.
// ============================================================

/** Визначає поточний режим теми оформлення */
export type ThemeMode = 'dark' | 'light';

/** Визначає обрану звукову тему для сповіщення таймера */
export type SoundTheme = 'classic' | 'digital';

/** Одне коло секундоміра */
export interface LapEntry {
  /** Унікальний рядковий ідентифікатор (Date.now().toString()) */
  id: string;
  /** Порядковий номер кола (починаючи з 1) */
  index: number;
  /** Загальний час у мілісекундах на момент фіксації кола */
  timeMs: number;
  /** Час від попереднього кола до цього (мілісекунди) */
  splitMs: number;
}

/** Об'єкт звукової теми для відображення в Налаштуваннях */
export interface SoundThemeOption {
  key: SoundTheme;
  /** Назва теми українською */
  label: string;
  /** Посилання на аудіо-ресурс через require() */
  assetPath: number;
}
