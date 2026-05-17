// ============================================================
// StopwatchScreen — екран секундоміра.
//
// Стан кнопок залежить від isRunning і elapsedMs:
//   elapsedMs === 0, !isRunning → [Старт]
//   isRunning                  → [Пауза] [Коло]
//   elapsedMs > 0, !isRunning  → [Продовжити] [Скинути]
//
// Список кіл (FlatList) відображає коло №N, час сплітування
// і загальний час. Перше (найновіше) коло підсвічено акцентом.
// Заголовки колонок приховані при порожньому списку.
// ============================================================

import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useTheme } from '@/hooks/useTheme';
import TimeDisplay from '@/components/TimeDisplay';
import CustomButton from '@/components/CustomButton';
import LapItem from '@/components/LapItem';
import { formatMs } from '@/utils/timeFormat';
import { FONT_FAMILY } from '@/constants/fonts';

export default function StopwatchScreen() {
  const { elapsedMs, isRunning, laps, start, pause, reset, lap } = useStopwatch();
  const { colors } = useTheme();

  const showLapHeaders = laps.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Головний дисплей часу */}
      <View style={styles.displayWrapper}>
        <TimeDisplay time={formatMs(elapsedMs)} size="large" />
      </View>

      {/* Рядок кнопок керування */}
      <View style={styles.buttonRow}>
        {!isRunning && elapsedMs === 0 && (
          <CustomButton label="Старт" onPress={start} variant="primary" />
        )}
        {isRunning && (
          <>
            <CustomButton label="Пауза" onPress={pause} variant="secondary" />
            <CustomButton label="Коло" onPress={lap} variant="secondary" />
          </>
        )}
        {!isRunning && elapsedMs > 0 && (
          <>
            <CustomButton label="Продовжити" onPress={start} variant="primary" />
            <CustomButton label="Скинути" onPress={reset} variant="danger" />
          </>
        )}
      </View>

      {/* Заголовки колонок */}
      {showLapHeaders && (
        <View style={[styles.lapHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.colLabel, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            Коло
          </Text>
          <Text style={[styles.colLabel, styles.colCenter, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            Сплітування
          </Text>
          <Text style={[styles.colLabel, styles.colRight, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            Загальний
          </Text>
        </View>
      )}

      {/* Список кіл */}
      <FlatList
        data={laps}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LapItem lap={item} isFirst={index === 0} />
        )}
        style={styles.lapList}
        contentContainerStyle={styles.lapListContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  displayWrapper: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  lapHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  colLabel: {
    flex: 1,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colCenter: { flex: 1.5, textAlign: 'center' },
  colRight: { flex: 1.5, textAlign: 'right' },
  lapList: {
    flex: 1,
  },
  lapListContent: {
    paddingBottom: 24,
  },
});
