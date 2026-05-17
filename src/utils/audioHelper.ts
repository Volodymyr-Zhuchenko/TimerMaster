// ============================================================
// Аудіо-хелпер для відтворення сигналу завершення таймера.
//
// Архітектурне рішення: _sound зберігається у змінній рівня модуля
// (singleton), а не у React state. Причина: Audio.Sound — це нативний
// об'єкт з власним life-cycle. Якщо зберігати його у state, React
// може зробити зайвий рендер або видалити посилання. Singleton гарантує,
// що завантажений звук завжди доступний для playSound().
//
// useCountdown викликає unloadSound() у cleanup useEffect,
// тому витоків пам'яті не буде.
// ============================================================

import { Audio } from 'expo-av';

let _sound: Audio.Sound | null = null;

/**
 * Завантажує аудіо-ресурс у пам'ять.
 * Перед завантаженням нового — вивантажує попередній.
 */
export async function loadSound(assetModule: number): Promise<void> {
  await unloadSound();
  try {
    const { sound } = await Audio.Sound.createAsync(assetModule);
    _sound = sound;
  } catch (e) {
    console.warn('[audioHelper] loadSound failed:', e);
  }
}

/**
 * Перемотує звук на початок і відтворює його.
 * Якщо звук не завантажено — нічого не робить.
 */
export async function playSound(): Promise<void> {
  if (!_sound) return;
  try {
    await _sound.setPositionAsync(0);
    await _sound.playAsync();
  } catch (e) {
    console.warn('[audioHelper] playSound failed:', e);
  }
}

/**
 * Вивантажує нативний аудіо-об'єкт і звільняє пам'ять.
 * Викликається при розмонтуванні useCountdown та при зміні звукової теми.
 */
export async function unloadSound(): Promise<void> {
  if (_sound) {
    try {
      await _sound.unloadAsync();
    } catch {
      // ігноруємо помилку при вивантаженні
    }
    _sound = null;
  }
}
