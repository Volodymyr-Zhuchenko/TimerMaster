// ============================================================
// useCountdown — логіка таймера зворотного відліку.
//
// Вибір джерела звуку при кожній зміні soundTheme або customSounds:
//   soundTheme є 'classic'/'digital' → вбудований assetPath + власна вібрація
//   soundTheme є UUID кастомного     → URI з customSounds + вібрація 'classic'
//
// Точність: endTimeRef = Date.now() + remainingMs (drift виключено).
// Cleanup: clearInterval + unloadSound() при розмонтуванні.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { SOUND_THEMES } from '@/constants/soundThemes';
import { loadSound, playSound, unloadSound } from '@/utils/audioHelper';
import { useSettings } from '@/hooks/useSettings';

export interface UseCountdownReturn {
  totalSeconds: number;
  remainingMs: number;
  isRunning: boolean;
  isFinished: boolean;
  setDuration: (seconds: number) => void;
  start: () => void;
  /** Sets duration and starts immediately — avoids async-state race. */
  startWithDuration: (seconds: number) => void;
  pause: () => void;
  reset: () => void;
}

export function useCountdown(): UseCountdownReturn {
  const { soundTheme, customSounds } = useSettings();
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  // Відновлення тривалості з AsyncStorage
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

  // Завантаження звуку при зміні теми або списку кастомних звуків
  useEffect(() => {
    const builtIn = SOUND_THEMES.find((t) => t.key === soundTheme);
    if (builtIn) {
      // Вбудована тема: асет + власний патерн вібрації
      loadSound(builtIn.assetPath, builtIn.vibrationPattern).catch(() => {});
    } else {
      // Кастомний звук: URI + вібрація як у 'classic'
      const custom = customSounds.find((s) => s.id === soundTheme);
      loadSound(custom?.uri ?? null, [0, 600]).catch(() => {});
    }
  }, [soundTheme, customSounds]);

  // Cleanup при розмонтуванні
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      unloadSound().catch(() => {});
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
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRemainingMs(0);
        setIsRunning(false);
        setIsFinished(true);
        playSound();
      } else {
        setRemainingMs(left);
      }
    }, 50);
    setIsRunning(true);
    setIsFinished(false);
  }, [isRunning, remainingMs]);

  const startWithDuration = useCallback(
    (seconds: number) => {
      if (isRunning || seconds <= 0) return;
      const ms = seconds * 1000;
      setTotalSeconds(seconds);
      setRemainingMs(ms);
      setIsFinished(false);
      AsyncStorage.setItem(STORAGE_KEYS.TIMER_DURATION, String(seconds)).catch(() => {});

      if (intervalRef.current) clearInterval(intervalRef.current);
      endTimeRef.current = Date.now() + ms;
      intervalRef.current = setInterval(() => {
        const left = endTimeRef.current - Date.now();
        if (left <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRemainingMs(0);
          setIsRunning(false);
          setIsFinished(true);
          playSound();
        } else {
          setRemainingMs(left);
        }
      }, 50);
      setIsRunning(true);
    },
    [isRunning],
  );

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

  return { totalSeconds, remainingMs, isRunning, isFinished, setDuration, start, startWithDuration, pause, reset };
}
