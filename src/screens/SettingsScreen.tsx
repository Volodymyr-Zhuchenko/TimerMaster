// ============================================================
// SettingsScreen — екран налаштувань.
//
// Секції:
//   1. Зовнішній вигляд — Switch для перемикання темної/світлої теми
//   2. Звукова тема    — вбудовані (без 🗑️) + кастомні (з 🗑️)
//                        + кнопка "Додати звук (N / 5)"
//   3. Про застосунок
//
// Логіка імпорту звуку:
//   expo-document-picker → обирає MP3/WAV із пристрою
//   expo-file-system.copyAsync → копіює у documentDirectory
//   useSettings.addCustomSound → зберігає у AsyncStorage + Context
//   useSettings.setSoundTheme  → одразу активує новий звук
// ============================================================

import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { SOUND_THEMES } from '@/constants/soundThemes';
import { FONT_FAMILY } from '@/constants/fonts';
import type { CustomSound } from '@/types';

export default function SettingsScreen() {
  const { colors, themeMode, toggleTheme } = useTheme();
  const { soundTheme, setSoundTheme, customSounds, addCustomSound, removeCustomSound } =
    useSettings();
  const [importing, setImporting] = useState(false);

  async function handlePickSound() {
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const id = Date.now().toString();
      const dest = `${FileSystem.documentDirectory}custom_sound_${id}.mp3`;

      await FileSystem.copyAsync({ from: asset.uri, to: dest });

      const newSound: CustomSound = {
        id,
        name: asset.name ?? `Звук ${id}`,
        uri: dest,
      };
      addCustomSound(newSound);
      setSoundTheme(id); // одразу активуємо
    } catch (e) {
      console.warn('[SettingsScreen] import sound error:', e);
    } finally {
      setImporting(false);
    }
  }

  const canAddMore = customSounds.length < 5;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Зовнішній вигляд ── */}
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

        {/* ── Звукова тема ── */}
        <Text
          style={[styles.sectionTitle, styles.sectionTop, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}
        >
          Звукова тема
        </Text>

        {/* Вбудовані теми (без кнопки видалення) */}
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
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: isActive ? colors.accent : colors.text, fontFamily: FONT_FAMILY.regular }]}>
                  {theme.label}
                </Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
                  {theme.description}
                </Text>
              </View>
              {isActive && <Text style={{ color: colors.accent, fontSize: 18 }}>✓</Text>}
            </TouchableOpacity>
          );
        })}

        {/* Кастомні звуки (з кнопкою 🗑️) */}
        {customSounds.map((cs) => {
          const isActive = soundTheme === cs.id;
          return (
            <View
              key={cs.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: isActive ? colors.accent : colors.border,
                  borderWidth: isActive ? 1.5 : 1,
                },
              ]}
            >
              {/* Ліва частина: натискаємо для вибору */}
              <TouchableOpacity
                style={styles.rowContent}
                onPress={() => setSoundTheme(cs.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.rowLabel, { color: isActive ? colors.accent : colors.text, fontFamily: FONT_FAMILY.regular }]}
                  numberOfLines={1}
                >
                  {cs.name}
                </Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
                  власний звук
                </Text>
              </TouchableOpacity>

              {/* Права частина: галочка + видалення */}
              <View style={styles.rowActions}>
                {isActive && <Text style={{ color: colors.accent, fontSize: 16, marginRight: 8 }}>✓</Text>}
                <TouchableOpacity onPress={() => removeCustomSound(cs.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ fontSize: 18 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Кнопка додавання звуку */}
        <TouchableOpacity
          onPress={handlePickSound}
          activeOpacity={canAddMore ? 0.7 : 1}
          style={[
            styles.addBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: importing ? 0.6 : 1,
            },
          ]}
        >
          {importing ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Text style={[styles.addBtnLabel, { color: colors.accent, fontFamily: FONT_FAMILY.medium }]}>
              {`+ Додати звук (${customSounds.length} / 5)`}
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Про застосунок ── */}
        <Text
          style={[styles.sectionTitle, styles.sectionTop, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}
        >
          Про застосунок
        </Text>
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            TimeMaster v1.0.0
          </Text>
          <Text style={[styles.rowDesc, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            Залікова робота
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 48 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionTop: { marginTop: 28 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowContent: {
    flex: 1,
    marginRight: 8,
  },
  rowLabel: { fontSize: 15 },
  rowDesc: { fontSize: 12, marginTop: 2 },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  addBtnLabel: { fontSize: 15 },
});
