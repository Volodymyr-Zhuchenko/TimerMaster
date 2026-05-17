// ============================================================
// audioHelper — сигнал завершення таймера.
//
// Три рівні зворотного зв'язку:
//   1. Аудіо (expo-av) — вбудований require() АБО URI кастомного файлу
//   2. Haptic (expo-haptics) — тактильний удар
//   3. Vibration (RN) — патерн вібрації (різний для кожної теми)
//
// loadSound приймає:
//   number  — результат require('...mp3'), вбудована тема
//   string  — URI файлу з documentDirectory (кастомний звук)
//   null    — лише вібрація + haptic, без аудіо
// ============================================================

import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

let _sound: Audio.Sound | null = null;
let _vibrationPattern: number[] = [0, 600];

// Встановлюємо audio mode при завантаженні модуля
Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
}).catch(() => {});

/**
 * Завантажує аудіо-джерело і запам'ятовує патерн вібрації.
 *
 * @param source — number (require result), string (URI) або null
 * @param vibrationPattern — масив ms для Vibration.vibrate()
 */
export async function loadSound(
  source: number | string | null,
  vibrationPattern: number[] = [0, 600],
): Promise<void> {
  await unloadSound();
  _vibrationPattern = vibrationPattern;
  if (source == null) return;

  try {
    // expo-av підтримує як module (number), так і { uri: string }
    const avSource = typeof source === 'string' ? { uri: source } : source;
    const { sound } = await Audio.Sound.createAsync(avSource);
    _sound = sound;
  } catch (e) {
    console.warn('[audioHelper] loadSound failed:', e);
  }
}

/**
 * Відтворює сигнал: haptic + вібрація + аудіо (якщо завантажено).
 */
export async function playSound(): Promise<void> {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  Vibration.vibrate(_vibrationPattern);

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
 * Зупиняє вібрацію та вивантажує аудіо-об'єкт.
 */
export async function unloadSound(): Promise<void> {
  Vibration.cancel();
  if (_sound) {
    try { await _sound.unloadAsync(); } catch { /* ігноруємо */ }
    _sound = null;
  }
}
