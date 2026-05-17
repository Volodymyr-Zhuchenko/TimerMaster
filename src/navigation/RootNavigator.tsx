import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/hooks/useTheme';
import StopwatchScreen from '@/screens/StopwatchScreen';
import TimerScreen from '@/screens/TimerScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Pill-style tab icon matching the design spec
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[
      styles.pill,
      { backgroundColor: focused ? colors.surface3 : 'transparent' },
    ]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 6,
            paddingBottom: 10,
            height: 68,
          },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Секундомір"
          component={StopwatchScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="⏰" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Таймер"
          component={TimerScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="⏳" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Налаштування"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 56,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
});
