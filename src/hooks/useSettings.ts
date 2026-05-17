// ============================================================
// useSettings — Context для налаштувань застосунку (звукова тема).
//
// Окремий контекст від useTheme, бо це незалежна відповідальність.
// Як TimerScreen (для завантаження звуку), так і SettingsScreen
// (для відображення та зміни) читають soundTheme з одного джерела.
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { SoundTheme } from '@/types';

interface SettingsContextValue {
  soundTheme: SoundTheme;
  setSoundTheme: (theme: SoundTheme) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  soundTheme: 'classic',
  setSoundTheme: () => {},
});

/** Провайдер налаштувань — розміщується під ThemeProvider у App.tsx */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>('classic');

  // Відновлення збереженої звукової теми
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.SOUND_THEME)
      .then((val) => {
        if (val === 'classic' || val === 'digital') {
          setSoundThemeState(val);
        }
      })
      .catch(() => {});
  }, []);

  const setSoundTheme = useCallback((theme: SoundTheme) => {
    setSoundThemeState(theme);
    AsyncStorage.setItem(STORAGE_KEYS.SOUND_THEME, theme).catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ soundTheme, setSoundTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

/** Хук для читання і зміни налаштувань у будь-якому компоненті */
export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
