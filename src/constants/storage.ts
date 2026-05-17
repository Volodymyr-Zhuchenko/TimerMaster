// Префікс 'timemaster:' гарантує відсутність колізій з іншими
// застосунками чи бібліотеками, що використовують AsyncStorage.
export const STORAGE_KEYS = {
  THEME: 'timemaster:theme',
  /** Зберігає 'classic', 'digital' або UUID кастомного звуку */
  SOUND_THEME: 'timemaster:soundTheme',
  STOPWATCH_LAPS: 'timemaster:stopwatch:laps',
  TIMER_DURATION: 'timemaster:timer:duration',
  /** JSON-рядок масиву CustomSound[] (до 5 елементів) */
  CUSTOM_SOUNDS: 'timemaster:custom:sounds',
  /** 'off' | 'pulse' */
  VIBRATION: 'timemaster:vibration',
} as const;
