import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { STORAGE_KEYS } from '@/constants/storage';
import type { CustomSound, SoundTheme, VibrationMode } from '@/types';

const MAX_CUSTOM_SOUNDS = 5;

interface SettingsContextValue {
  soundTheme: SoundTheme;
  setSoundTheme: (theme: SoundTheme) => void;
  customSounds: CustomSound[];
  addCustomSound: (sound: CustomSound) => void;
  removeCustomSound: (id: string) => void;
  vibration: VibrationMode;
  setVibration: (mode: VibrationMode) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  soundTheme: 'default',
  setSoundTheme: () => {},
  customSounds: [],
  addCustomSound: () => {},
  removeCustomSound: () => {},
  vibration: 'off',
  setVibration: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>('default');
  const [customSounds, setCustomSoundsState] = useState<CustomSound[]>([]);
  const [vibration, setVibrationState] = useState<VibrationMode>('off');

  useEffect(() => {
    AsyncStorage.multiGet([
      STORAGE_KEYS.SOUND_THEME,
      STORAGE_KEYS.CUSTOM_SOUNDS,
      STORAGE_KEYS.VIBRATION,
    ])
      .then(([themeEntry, soundsEntry, vibrationEntry]) => {
        const theme = themeEntry[1];
        // Мігруємо старі значення 'classic'/'digital' → 'default'
        if (theme === 'classic' || theme === 'digital' || theme === 'default') {
          setSoundThemeState('default');
        } else if (theme) {
          setSoundThemeState(theme);
        }

        const soundsJson = soundsEntry[1];
        if (soundsJson) {
          try {
            const parsed = JSON.parse(soundsJson) as CustomSound[];
            if (Array.isArray(parsed)) setCustomSoundsState(parsed);
          } catch { /* пошкоджені дані — порожній стан */ }
        }

        const vib = vibrationEntry[1];
        if (vib === 'off' || vib === 'pulse') setVibrationState(vib);
      })
      .catch(() => {});
  }, []);

  const setSoundTheme = useCallback((theme: SoundTheme) => {
    setSoundThemeState(theme);
    AsyncStorage.setItem(STORAGE_KEYS.SOUND_THEME, theme).catch(() => {});
  }, []);

  const setVibration = useCallback((mode: VibrationMode) => {
    setVibrationState(mode);
    AsyncStorage.setItem(STORAGE_KEYS.VIBRATION, mode).catch(() => {});
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

      FileSystem.deleteAsync(sound.uri, { idempotent: true }).catch(() => {});

      const updated = customSounds.filter((s) => s.id !== id);
      setCustomSoundsState(updated);
      AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SOUNDS, JSON.stringify(updated)).catch(() => {});

      if (soundTheme === id) {
        setSoundThemeState('default');
        AsyncStorage.setItem(STORAGE_KEYS.SOUND_THEME, 'default').catch(() => {});
      }
    },
    [customSounds, soundTheme],
  );

  return (
    <SettingsContext.Provider
      value={{ soundTheme, setSoundTheme, customSounds, addCustomSound, removeCustomSound, vibration, setVibration }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
