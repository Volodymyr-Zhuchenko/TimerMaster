import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { DEFAULT_SOUND_ASSET } from '@/constants/soundThemes';
import { loadSound, startLoopingAlert, stopLoopingAlert, unloadSound } from '@/utils/audioHelper';
import { useSettings } from '@/hooks/useSettings';
import type { VibrationMode } from '@/types';

export interface UseCountdownReturn {
  totalSeconds: number;
  remainingMs: number;
  isRunning: boolean;
  isFinished: boolean;
  setDuration: (seconds: number) => void;
  start: () => void;
  startWithDuration: (seconds: number) => void;
  pause: () => void;
  reset: () => void;
}

export function useCountdown(): UseCountdownReturn {
  const { soundTheme, customSounds, vibration } = useSettings();
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const vibrationRef = useRef<VibrationMode>('off');
  const resetRef = useRef<() => void>(() => {});

  // Sync refs so interval callbacks always have the latest values
  useEffect(() => { vibrationRef.current = vibration; }, [vibration]);

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

  // Завантаження звуку при зміні теми або кастомних звуків
  useEffect(() => {
    if (soundTheme === 'default') {
      loadSound(DEFAULT_SOUND_ASSET).catch(() => {});
    } else {
      const custom = customSounds.find((s) => s.id === soundTheme);
      loadSound(custom?.uri ?? null).catch(() => {});
    }
  }, [soundTheme, customSounds]);

  // Cleanup при розмонтуванні
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopLoopingAlert();
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
        startLoopingAlert(vibrationRef.current);
        Alert.alert(
          'Час закінчився', '',
          [{ text: 'OK', onPress: () => { stopLoopingAlert(); resetRef.current(); } }],
          { cancelable: false },
        );
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
          startLoopingAlert(vibrationRef.current);
          Alert.alert(
            'Час закінчився', '',
            [{ text: 'OK', onPress: () => { stopLoopingAlert(); resetRef.current(); } }],
            { cancelable: false },
          );
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
    stopLoopingAlert();
    setIsRunning(false);
    setIsFinished(false);
    setRemainingMs(totalSeconds * 1000);
  }, [totalSeconds]);

  useEffect(() => { resetRef.current = reset; }, [reset]);

  return { totalSeconds, remainingMs, isRunning, isFinished, setDuration, start, startWithDuration, pause, reset };
}
