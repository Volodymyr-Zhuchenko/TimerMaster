// ============================================================
// useCountdown — логіка таймера зворотного відліку.
//
// Ключові архітектурні рішення:
//
// 1. endTimeRef = Date.now() + remainingMs:
//    При кожному тіку обчислюємо left = endTimeRef - Date.now().
//    Так само як у useStopwatch, це виключає drift від нерівномірних
//    тіків setInterval.
//
// 2. Завантаження звуку при зміні soundTheme:
//    useEffect з [soundTheme] перезавантажує аудіо-файл при виборі
//    нової теми в Налаштуваннях. soundLoadedRef запобігає подвійному
//    завантаженню при незмінній темі.
//
// 3. Cleanup:
//    При розмонтуванні (перехід на іншу вкладку або закриття) —
//    clearInterval + unloadSound(), щоб звільнити native audio buffer.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { SOUND_THEMES } from '@/constants/soundThemes';
import { loadSound, playSound, unloadSound } from '@/utils/audioHelper';
import type { SoundTheme } from '@/types';

export interface UseCountdownReturn {
  totalSeconds: number;
  remainingMs: number;
  isRunning: boolean;
  isFinished: boolean;
  setDuration: (seconds: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useCountdown(soundTheme: SoundTheme): UseCountdownReturn {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);         // абсолютний момент закінчення
  const soundLoadedRef = useRef<SoundTheme | null>(null); // яка тема зараз в пам'яті

  // Відновлення збереженої тривалості
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.TIMER_DURATION)
      .then((val) => {
        if (val) {
          const sec = parseInt(val, 10);
          if (!isNaN(sec) && sec > 0) {
            setTotalSeconds(sec);
            setRemainingMs(sec * 1000);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Перезавантаження звуку при зміні звукової теми
  useEffect(() => {
    if (soundLoadedRef.current === soundTheme) return;
    const themeOption = SOUND_THEMES.find((t) => t.key === soundTheme);
    if (themeOption) {
      loadSound(themeOption.assetPath).then(() => {
        soundLoadedRef.current = soundTheme;
      });
    }
  }, [soundTheme]);

  // Cleanup при розмонтуванні
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      unloadSound();
    };
  }, []);

  const setDuration = useCallback(
    (seconds: number) => {
      if (isRunning) return;
      setTotalSeconds(seconds);
      setRemainingMs(seconds * 1000);
      setIsFinished(false);
      AsyncStorage.setItem(STORAGE_KEYS.TIMER_DURATION, String(seconds)).catch(() => {});
    },
    [isRunning],
  );

  const start = useCallback(() => {
    if (isRunning || remainingMs <= 0) return;
    endTimeRef.current = Date.now() + remainingMs;
    intervalRef.current = setInterval(() => {
      const left = endTimeRef.current - Date.now();
      if (left <= 0) {
        // Таймер досяг нуля
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRemainingMs(0);
        setIsRunning(false);
        setIsFinished(true);
        playSound(); // відтворення сигналу завершення
      } else {
        setRemainingMs(left);
      }
    }, 50); // 50 мс — баланс між плавністю і навантаженням на CPU
    setIsRunning(true);
    setIsFinished(false);
  }, [isRunning, remainingMs]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsFinished(false);
    setRemainingMs(totalSeconds * 1000);
  }, [totalSeconds]);

  return {
    totalSeconds,
    remainingMs,
    isRunning,
    isFinished,
    setDuration,
    start,
    pause,
    reset,
  };
}
