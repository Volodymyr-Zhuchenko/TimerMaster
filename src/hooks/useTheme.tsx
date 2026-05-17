// ============================================================
// useTheme — Context для управління темою оформлення.
//
// Архітектурне рішення: React Context + Provider замість глобального
// стану (Redux/Zustand). Підходить для цього застосунку, бо тема —
// це крос-компонентний, але рідко змінюваний стан.
// Всі компоненти отримують { colors, themeMode, toggleTheme }
// одним викликом useTheme() без prop drilling.
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_THEME, LIGHT_THEME, type ThemeColors } from '@/constants/colors';
import { STORAGE_KEYS } from '@/constants/storage';
import type { ThemeMode } from '@/types';

interface ThemeContextValue {
  colors: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

// Дефолтне значення контексту — темна тема.
// Використовується лише якщо компонент рендериться поза ThemeProvider.
const ThemeContext = createContext<ThemeContextValue>({
  colors: DARK_THEME,
  themeMode: 'dark',
  toggleTheme: () => {},
});

/** Провайдер теми — огортає весь застосунок в App.tsx */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  // Відновлення теми з AsyncStorage при першому монтуванні
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME)
      .then((val) => {
        if (val === 'light' || val === 'dark') {
          setThemeMode(val);
        }
      })
      .catch(() => {});
  }, []);

  // useCallback мемоізує функцію — щоб не перестворювати її при кожному рендері
  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEYS.THEME, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ colors, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Хук для читання теми у будь-якому компоненті */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
