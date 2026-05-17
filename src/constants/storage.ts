// Префікс 'timemaster:' гарантує відсутність колізій з іншими
// застосунками чи бібліотеками, що використовують AsyncStorage.
export const STORAGE_KEYS = {
  THEME: 'timemaster:theme',
  SOUND_THEME: 'timemaster:soundTheme',
  /** Зберігається як JSON-рядок масиву LapEntry[] */
  STOPWATCH_LAPS: 'timemaster:stopwatch:laps',
  /** Зберігається як рядок цілого числа (секунди) */
  TIMER_DURATION: 'timemaster:timer:duration',
} as const;
