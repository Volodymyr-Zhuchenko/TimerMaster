// ============================================================
// App.tsx — кореневий компонент застосунку TimeMaster.
//
// Відповідальності:
//   1. Завантаження шрифтів IBM Plex Mono (3 варіанти)
//   2. Налаштування аудіо-режиму expo-av для iOS
//   3. Надання React Context для теми і налаштувань
//   4. Рендеринг навігації після готовності шрифтів
//
// Порядок Provider-ів важливий:
//   ThemeProvider (зовні) → SettingsProvider → RootNavigator
//   Причина: RootNavigator викликає useTheme() на рівні компонента,
//   тому він має бути всередині ThemeProvider.
// ============================================================

import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  IBMPlexMono_300Light,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import { ThemeProvider } from '@/hooks/useTheme';
import { SettingsProvider } from '@/hooks/useSettings';
import RootNavigator from '@/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    IBMPlexMono_300Light,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  // Показуємо темний фон поки шрифти вантажаться (splash-подібний стан)
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0E0F12' }} />;
  }

  return (
    <ThemeProvider>
      <SettingsProvider>
        <RootNavigator />
        <StatusBar style="light" />
      </SettingsProvider>
    </ThemeProvider>
  );
}
