// ============================================================
// SettingsScreen — екран налаштувань.
//
// Дві секції:
//   1. Зовнішній вигляд — Switch для перемикання темної/світлої теми.
//   2. Звукові теми — список варіантів з підсвіченим поточним вибором.
//
// Стан зберігається у Context (useTheme, useSettings) і
// синхронізується з AsyncStorage автоматично у відповідних хуках.
// ============================================================

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { SOUND_THEMES } from '@/constants/soundThemes';
import { FONT_FAMILY } from '@/constants/fonts';

export default function SettingsScreen() {
  const { colors, themeMode, toggleTheme } = useTheme();
  const { soundTheme, setSoundTheme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* --- Секція: Зовнішній вигляд --- */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
          Зовнішній вигляд
        </Text>

        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.text, fontFamily: FONT_FAMILY.regular }]}>
            Темна тема
          </Text>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.text}
            ios_backgroundColor={colors.border}
          />
        </View>

        {/* --- Секція: Звуки --- */}
        <Text
          style={[
            styles.sectionTitle,
            styles.sectionTitleTop,
            { color: colors.textMuted, fontFamily: FONT_FAMILY.regular },
          ]}
        >
          Звукова тема
        </Text>

        {SOUND_THEMES.map((theme) => {
          const isActive = soundTheme === theme.key;
          return (
            <TouchableOpacity
              key={theme.key}
              onPress={() => setSoundTheme(theme.key)}
              activeOpacity={0.7}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: isActive ? colors.accent : colors.border,
                  borderWidth: isActive ? 1.5 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.rowLabel,
                  { color: isActive ? colors.accent : colors.text, fontFamily: FONT_FAMILY.regular },
                ]}
              >
                {theme.label}
              </Text>
              <Text style={[styles.rowRight, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
                {theme.description}
              </Text>
              {isActive && (
                <Text style={{ color: colors.accent, fontSize: 18, marginLeft: 8 }}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* --- Інформація про застосунок --- */}
        <Text
          style={[
            styles.sectionTitle,
            styles.sectionTitleTop,
            { color: colors.textMuted, fontFamily: FONT_FAMILY.regular },
          ]}
        >
          Про застосунок
        </Text>
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            TimeMaster v1.0.0
          </Text>
          <Text style={[styles.rowRight, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            Залікова робота
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionTitleTop: {
    marginTop: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowRight: {
    fontSize: 13,
  },
});
