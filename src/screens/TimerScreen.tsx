// ============================================================
// TimerScreen — екран таймера зворотного відліку.
//
// Вибір часу: три стовпці кнопок +/- (Год / Хв / Сек).
// Цей підхід обрано замість ScrollPicker або Picker,
// оскільки не потребує додаткових бібліотек і добре
// виглядає на будь-якому розмірі екрана.
//
// Кругова дуга: progress = remainingMs / (totalSeconds * 1000).
// При progress=1 — повне кільце (щойно запущено або скинуто).
// При progress=0 — порожнє кільце (завершено).
//
// Сигнал: useCountdown грає звук автоматично при left ≤ 0;
// TimerScreen лише показує "Час вийшов!" та зелений текст.
// ============================================================

import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useCountdown } from '@/hooks/useCountdown';
import { useTheme } from '@/hooks/useTheme';
import CircularProgress from '@/components/CircularProgress';
import TimeDisplay from '@/components/TimeDisplay';
import CustomButton from '@/components/CustomButton';
import { formatSeconds } from '@/utils/timeFormat';
import { FONT_FAMILY } from '@/constants/fonts';

/** Кнопки +/- для однієї одиниці часу */
function TimeUnitPicker({
  label,
  value,
  max,
  onChange,
  colors,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.pickerCol}>
      <Text
        style={[styles.pickerBtn, { color: colors.accent }]}
        onPress={() => onChange(Math.min(value + 1, max))}
      >
        ▲
      </Text>
      <Text style={[styles.pickerVal, { color: colors.text, fontFamily: FONT_FAMILY.light }]}>
        {String(value).padStart(2, '0')}
      </Text>
      <Text
        style={[styles.pickerBtn, { color: colors.accent }]}
        onPress={() => onChange(Math.max(value - 1, 0))}
      >
        ▼
      </Text>
      <Text style={[styles.pickerLabel, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TimerScreen() {
  const { totalSeconds, remainingMs, isRunning, isFinished, setDuration, start, pause, reset } =
    useCountdown();
  const { colors } = useTheme();

  // Локальний стан picker (відображається лише коли таймер зупинений і не запущений)
  const [pickerH, setPickerH] = useState(0);
  const [pickerM, setPickerM] = useState(0);
  const [pickerS, setPickerS] = useState(30);

  // Чи показуємо picker (вибір часу) чи дисплей зворотного відліку
  const isIdle = !isRunning && remainingMs === totalSeconds * 1000 && !isFinished;

  const progress = totalSeconds > 0 ? remainingMs / (totalSeconds * 1000) : 1;
  const displayTime = formatSeconds(Math.ceil(remainingMs / 1000));

  function handleSet() {
    const total = pickerH * 3600 + pickerM * 60 + pickerS;
    if (total > 0) setDuration(total);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Picker вибору часу */}
      {isIdle && (
        <View style={styles.pickerRow}>
          <TimeUnitPicker
            label="год"
            value={pickerH}
            max={23}
            onChange={setPickerH}
            colors={colors}
          />
          <Text style={[styles.colon, { color: colors.textMuted }]}>:</Text>
          <TimeUnitPicker
            label="хв"
            value={pickerM}
            max={59}
            onChange={setPickerM}
            colors={colors}
          />
          <Text style={[styles.colon, { color: colors.textMuted }]}>:</Text>
          <TimeUnitPicker
            label="сек"
            value={pickerS}
            max={59}
            onChange={setPickerS}
            colors={colors}
          />
        </View>
      )}

      {/* Кругова дуга з відліком */}
      <View style={styles.ringWrapper}>
        <CircularProgress size={280} strokeWidth={12} progress={progress}>
          <TimeDisplay time={displayTime} size="small" />
          {isFinished && (
            <Text
              style={[styles.finishedLabel, { color: colors.accent, fontFamily: FONT_FAMILY.regular }]}
            >
              Час вийшов!
            </Text>
          )}
        </CircularProgress>
      </View>

      {/* Кнопки керування */}
      <View style={styles.buttonRow}>
        {isIdle && (
          <CustomButton
            label="Встановити"
            onPress={handleSet}
            variant="secondary"
            disabled={pickerH === 0 && pickerM === 0 && pickerS === 0}
          />
        )}
        {!isIdle && !isRunning && !isFinished && (
          <CustomButton label="Старт" onPress={start} variant="primary" />
        )}
        {isRunning && (
          <CustomButton label="Пауза" onPress={pause} variant="secondary" />
        )}
        {!isIdle && (
          <CustomButton label="Скинути" onPress={reset} variant="danger" />
        )}
        {isFinished && (
          <CustomButton label="Новий таймер" onPress={reset} variant="primary" />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  pickerCol: {
    alignItems: 'center',
    width: 64,
  },
  pickerBtn: {
    fontSize: 22,
    padding: 6,
  },
  pickerVal: {
    fontSize: 36,
    letterSpacing: -1,
    marginVertical: 4,
  },
  pickerLabel: {
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 4,
  },
  colon: {
    fontSize: 32,
    marginBottom: 20,
    marginHorizontal: 4,
  },
  ringWrapper: {
    marginVertical: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  finishedLabel: {
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
