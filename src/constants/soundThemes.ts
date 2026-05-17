// Metro bundler вимагає статичного require() — змінна тут неприпустима.
export const DEFAULT_SOUND_ASSET: number =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../assets/sounds/timer-bell_m1tycbno.mp3');
