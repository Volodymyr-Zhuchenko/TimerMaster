// ============================================================
// RootNavigator — нижня панель навігації (3 вкладки).
//
// Кольори tab bar читаються з useTheme() — при перемиканні теми
// в Налаштуваннях вся навігаційна панель оновлює кольори без
// перезапуску застосунку.
//
// Іконки: Emoji-символи працюють на iOS і Android без додаткових
// бібліотек. Для виробничого застосунку можна замінити на
// @expo/vector-icons (Ionicons), але для навчального проєкту
// emoji цілком достатньо.
// ============================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import StopwatchScreen from '@/screens/StopwatchScreen';
import TimerScreen from '@/screens/TimerScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { FONT_FAMILY } from '@/constants/fonts';

const Tab = createBottomTabNavigator();

/** Міні-іконка для вкладки (emoji + розмір) */
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{emoji}</Text>;
}

export default function RootNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarLabelStyle: {
            fontFamily: FONT_FAMILY.regular,
            fontSize: 11,
            marginBottom: 2,
          },
        }}
      >
        <Tab.Screen
          name="Секундомір"
          component={StopwatchScreen}
          options={{
            tabBarIcon: ({ color }) => <TabIcon emoji="⏱" color={color} />,
          }}
        />
        <Tab.Screen
          name="Таймер"
          component={TimerScreen}
          options={{
            tabBarIcon: ({ color }) => <TabIcon emoji="⏳" color={color} />,
          }}
        />
        <Tab.Screen
          name="Налаштування"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
