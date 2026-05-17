// ВАЖЛИВО: require() тут має бути статичним рядком —
// Metro bundler не підтримує динамічні require(variable).
// Обидва MP3-файли мають фізично існувати в assets/sounds/
// перед першим запуском.
import type { SoundThemeOption } from '@/types';

export const SOUND_THEMES: SoundThemeOption[] = [
  {
    key: 'classic',
    label: 'Класичний',
    assetPath: require('../../assets/sounds/beep_classic.mp3'),
  },
  {
    key: 'digital',
    label: 'Цифровий',
    assetPath: require('../../assets/sounds/beep_digital.mp3'),
  },
];
