// ============================================================
// useStopwatch — вся логіка секундоміра в одному хуку.
//
// Ключові архітектурні рішення:
//
// 1. Вимірювання часу через Date.now() (а не лічильник тіків):
//    setInterval може затримуватись у фоні або при навантаженні CPU.
//    Зберігаючи startTimeRef (wall-clock), ми завжди обчислюємо
//    реальний минулий час як (Date.now() - start + base), тому
//    drift (відхилення) виключено.
//
// 2. Уникнення витоків пам'яті:
//    clearInterval викликається в cleanup useEffect при розмонтуванні
//    і явно перед кожним reset/pause.
//
// 3. Персистентність кіл:
//    Зберігається лише масив laps[], а не elapsedMs і isRunning —
//    відновлення "запущеного" таймера після закриття застосунку
//    було б заплутаним для користувача.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { LapEntry } from '@/types';

export interface UseStopwatchReturn {
  elapsedMs: number;
  isRunning: boolean;
  laps: LapEntry[];
  start: () => void;
  pause: () => void;
  reset: () => void;
  lap: () => void;
}

export function useStopwatch(): UseStopwatchReturn {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapEntry[]>([]);

  // Refs не викликають ре-рендер — ідеальні для зберігання
  // внутрішнього стану таймера між тіками
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);    // wall-clock moment of last start()
  const baseElapsedRef = useRef<number>(0);  // accumulated ms before last start()
  const lastLapMsRef = useRef<number>(0);    // elapsedMs at last lap boundary

  // Відновлення кіл з AsyncStorage (лише при першому монтуванні)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.STOPWATCH_LAPS)
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val) as LapEntry[];
            if (Array.isArray(parsed)) setLaps(parsed);
          } catch {
            // Пошкоджений JSON — починаємо з порожнього стану
          }
        }
      })
      .catch(() => {});
  }, []);

  // Збереження кіл при кожній зміні масиву
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.STOPWATCH_LAPS, JSON.stringify(laps)).catch(() => {});
  }, [laps]);

  // Cleanup при розмонтуванні компонента
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = Date.now();
    baseElapsedRef.current = elapsedMs;
    intervalRef.current = setInterval(() => {
      // Різниця wall-clock — основа точного таймінгу
      setElapsedMs(Date.now() - startTimeRef.current + baseElapsedRef.current);
    }, 30); // 30 мс ≈ 33 fps, достатньо для відображення мілісекунд
    setIsRunning(true);
  }, [isRunning, elapsedMs]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
    lastLapMsRef.current = 0;
    baseElapsedRef.current = 0;
  }, []);

  const lap = useCallback(() => {
    if (!isRunning) return;
    // Функціональний updater читає актуальне elapsedMs без stale closure
    setElapsedMs((current) => {
      const splitMs = current - lastLapMsRef.current;
      lastLapMsRef.current = current;
      const newLap: LapEntry = {
        id: Date.now().toString(),
        index: 0, // буде встановлено нижче через setLaps
        timeMs: current,
        splitMs,
      };
      setLaps((prev) => {
        const withIndex: LapEntry = { ...newLap, index: prev.length + 1 };
        return [withIndex, ...prev]; // новіші кола — зверху
      });
      return current;
    });
  }, [isRunning]);

  return { elapsedMs, isRunning, laps, start, pause, reset, lap };
}
