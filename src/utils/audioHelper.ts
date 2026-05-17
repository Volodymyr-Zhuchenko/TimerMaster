// ============================================================
// audioHelper — сигнал завершення таймера.
//
// Три рівні зворотного зв'язку при спрацюванні таймера:
//   1. Аудіо (expo-av)     — відтворює timer-bell.mp3
//   2. Haptic (expo-haptics) — тактильний удар на сумісних пристроях
//   3. Vibration (RN API)  — патерн вібрації (різний для кожної теми)
//
// Singleton _sound: Audio.Sound зберігається поза React state,
// щоб уникнути зайвих ре-рендерів і гарантувати стабільне посилання
// між асинхронними викликами.
//
// playsInSilentModeIOS: true — необхідно для iOS,
// де система за замовчуванням блокує аудіо у беззвучному режимі.
// ============================================================

import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

let _sound: Audio.Sound | null = null;
let _vibrationPattern: number[] = [0, 600];

// Встановлюємо аудіо-режим один раз при завантаженні модуля
Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
}).catch(() => {});

/**
 * Завантажує аудіо-файл і запам'ятовує патерн вібрації.
 * Викликається у useCountdown при зміні SoundTheme.
 *
 * @param assetModule — результат require('...mp3')
 * @param vibrationPattern — масив ms: [затримка, вібрація, пауза, ...]
 */
export async function loadSound(
  assetModule: number | null,
  vibrationPattern: number[] = [0, 600],
): Promise<void> {
  await unloadSound();
  _vibrationPattern = vibrationPattern;
  if (assetModule == null) return;
  try {
    const { sound } = await Audio.Sound.createAsync(assetModule);
    _sound = sound;
  } catch (e) {
    console.warn('[audioHelper] loadSound failed:', e);
  }
}

/**
 * Відтворює сигнал: аудіо + haptic + вібрація одночасно.
 */
export async function playSound(): Promise<void> {
  // Haptic feedback (не блокуємо на пристроях без підтримки)
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

  // Вібрація за обраним патерном
  Vibration.vibrate(_vibrationPattern);

  // Аудіо (якщо завантажено)
  if (_sound) {
    try {
      await _sound.setPositionAsync(0);
      await _sound.playAsync();
    } catch (e) {
      console.warn('[audioHelper] playSound failed:', e);
    }
  }
}

/**
 * Зупиняє вібрацію та вивантажує аудіо-об'єкт із пам'яті.
 * Викликається у cleanup useEffect useCountdown.
 */
export async function unloadSound(): Promise<void> {
  Vibration.cancel();
  if (_sound) {
    try {
      await _sound.unloadAsync();
    } catch {
      /* ігноруємо */
    }
    _sound = null;
  }
}
