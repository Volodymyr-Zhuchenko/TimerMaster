// Обидві теми використовують один аудіо-файл (timer-bell),
// але різняться патерном вібрації для додаткового тактильного відчуття.
// Metro bundler вимагає статичного require() — змінна тут неприпустима.
import type { SoundThemeOption } from '@/types';

export const SOUND_THEMES: SoundThemeOption[] = [
  {
    key: 'classic',
    label: 'Класичний',
    description: 'Дзвін + одинарний імпульс',
    assetPath: require('../../assets/sounds/timer-bell_m1tycbno.mp3'),
    vibrationPattern: [0, 600],
  },
  {
    key: 'digital',
    label: 'Цифровий',
    description: 'Дзвін + серія імпульсів',
    assetPath: require('../../assets/sounds/timer-bell_m1tycbno.mp3'),
    vibrationPattern: [0, 200, 100, 200, 100, 400],
  },
];
