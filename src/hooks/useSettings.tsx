// ============================================================
// useSettings — Context для налаштувань застосунку.
//
// Керує:
//   soundTheme   — ID активної теми ('classic'/'digital' або UUID)
//   customSounds — масив до 5 імпортованих користувачем звуків
//
// addCustomSound: якщо вже є 5 звуків — показує Alert, нічого не додає.
// removeCustomSound: видаляє файл із FileSystem і з масиву;
//   якщо видалений звук був активним — перемикає на 'classic'.
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { STORAGE_KEYS } from '@/constants/storage';
import type { CustomSound, SoundTheme } from '@/types';

const MAX_CUSTOM_SOUNDS = 5;

interface SettingsContextValue {
  soundTheme: SoundTheme;
  setSoundTheme: (theme: SoundTheme) => void;
  customSounds: CustomSound[];
  addCustomSound: (sound: CustomSound) => void;
  removeCustomSound: (id: string) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  soundTheme: 'classic',
  setSoundTheme: () => {},
  customSounds: [],
  addCustomSound: () => {},
  removeCustomSound: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>('classic');
  const [customSounds, setCustomSoundsState] = useState<CustomSound[]>([]);

  // Відновлення звукових налаштувань із AsyncStorage
  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEYS.SOUND_THEME, STORAGE_KEYS.CUSTOM_SOUNDS])
      .then(([themeEntry, soundsEntry]) => {
        const theme = themeEntry[1];
        if (theme) setSoundThemeState(theme);

        const soundsJson = soundsEntry[1];
        if (soundsJson) {
          try {
            const parsed = JSON.parse(soundsJson) as CustomSound[];
            if (Array.isArray(parsed)) setCustomSoundsState(parsed);
          } catch { /* пошкоджені дані — порожній стан */ }
        }
      })
      .catch(() => {});
  }, []);

  const setSoundTheme = useCallback((theme: SoundTheme) => {
    setSoundThemeState(theme);
    AsyncStorage.setItem(STORAGE_KEYS.SOUND_THEME, theme).catch(() => {});
  }, []);

  const addCustomSound = useCallback(
    (sound: CustomSound) => {
      if (customSounds.length >= MAX_CUSTOM_SOUNDS) {
        Alert.alert(
          'Ліміт досягнуто',
          `Для імпорту нового звуку видаліть один із ${MAX_CUSTOM_SOUNDS} вже доданих.`,
          [{ text: 'Зрозуміло' }],
        );
        return;
      }
      const updated = [...customSounds, sound];
      setCustomSoundsState(updated);
      AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SOUNDS, JSON.stringify(updated)).catch(() => {});
    },
    [customSounds],
  );

  const removeCustomSound = useCallback(
    (id: string) => {
      const sound = customSounds.find((s) => s.id === id);
      if (!sound) return;

      // Видаляємо файл із файлової системи
      FileSystem.deleteAsync(sound.uri, { idempotent: true }).catch(() => {});

      const updated = customSounds.filter((s) => s.id !== id);
      setCustomSoundsState(updated);
      AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SOUNDS, JSON.stringify(updated)).catch(() => {});

      // Якщо видалений звук був активним — повертаємось до 'classic'
      if (soundTheme === id) {
        setSoundThemeState('classic');
        AsyncStorage.setItem(STORAGE_KEYS.SOUND_THEME, 'classic').catch(() => {});
      }
    },
    [customSounds, soundTheme],
  );

  return (
    <SettingsContext.Provider
      value={{ soundTheme, setSoundTheme, customSounds, addCustomSound, removeCustomSound }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
