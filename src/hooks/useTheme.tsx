import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_THEME, LIGHT_THEME, type ThemeColors } from '@/constants/colors';
import { STORAGE_KEYS } from '@/constants/storage';
import type { ThemeMode } from '@/types';

interface ThemeContextValue {
  colors: ThemeColors;
  themeMode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: DARK_THEME,
  themeMode: 'dark',
  resolvedMode: 'dark',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const systemScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME)
      .then((val) => {
        if (val === 'light' || val === 'dark' || val === 'system') {
          setThemeModeState(val);
        }
      })
      .catch(() => {});
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEYS.THEME, mode).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  const resolvedMode: 'light' | 'dark' =
    themeMode === 'system' ? ((systemScheme ?? 'dark') as 'light' | 'dark') : themeMode;
  const colors = resolvedMode === 'light' ? LIGHT_THEME : DARK_THEME;

  return (
    <ThemeContext.Provider value={{ colors, themeMode, resolvedMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
