import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useCountdown } from '@/hooks/useCountdown';
import { useTheme } from '@/hooks/useTheme';
import ScreenHeader from '@/components/ScreenHeader';
import TickDial from '@/components/TickDial';
import { FabButton, SideButton } from '@/components/CustomButton';
import { stopLoopingAlert } from '@/utils/audioHelper';
import { FONT_FAMILY } from '@/constants/fonts';

// ─── Wheel column (above / selected / below) ─────────────

function Wheel({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const { colors } = useTheme();
  const d = (v: number) => String(v).padStart(2, '0');
  const above = (value + 1) % (max + 1);
  const below = (value - 1 + max + 1) % (max + 1);

  return (
    <View style={styles.wheel}>
      {/* Selection highlight */}
      <View style={[styles.wheelHighlight, { backgroundColor: colors.surface, borderColor: colors.border }]} />

      {/* Above (tap to increment) */}
      <TouchableOpacity
        style={styles.wheelAboveBelow}
        onPress={() => onChange(above)}
        activeOpacity={0.6}
      >
        <Text style={[styles.wheelDim, { color: colors.textDim }]}>
          {d(above)}
        </Text>
      </TouchableOpacity>

      {/* Selected */}
      <View style={styles.wheelSelected}>
        <Text style={[styles.wheelValue, { color: colors.text }]}>
          {d(value)}
        </Text>
      </View>

      {/* Below (tap to decrement) */}
      <TouchableOpacity
        style={styles.wheelAboveBelow}
        onPress={() => onChange(below)}
        activeOpacity={0.6}
      >
        <Text style={[styles.wheelDim, { color: colors.textDim }]}>
          {d(below)}
        </Text>
      </TouchableOpacity>

      {/* Label */}
      <Text style={[styles.wheelLabel, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Preset chips ─────────────────────────────────────────

const PRESETS = [
  { l: '1 хв', h: 0, m: 1, s: 0 },
  { l: '3 хв', h: 0, m: 3, s: 0 },
  { l: '5 хв', h: 0, m: 5, s: 0 },
  { l: '10 хв', h: 0, m: 10, s: 0 },
  { l: '25 хв', h: 0, m: 25, s: 0 },
  { l: '1 год', h: 1, m: 0, s: 0 },
];

// ─── Main screen ─────────────────────────────────────────

export default function TimerScreen() {
  const { colors } = useTheme();
  const {
    totalSeconds,
    remainingMs,
    isRunning,
    isFinished,
    startWithDuration,
    start,
    pause,
    reset,
  } = useCountdown();

  const isFocused = useIsFocused();

  const [pickerH, setPickerH] = useState(0);
  const [pickerM, setPickerM] = useState(0);
  const [pickerS, setPickerS] = useState(0);

  // Popup лише якщо таймер закінчився саме поки цей екран активний
  useEffect(() => {
    if (isFinished && isFocused) {
      Alert.alert(
        'Час закінчився',
        '',
        [{ text: 'OK', onPress: () => { stopLoopingAlert(); reset(); } }],
        { cancelable: false },
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const isIdle = !isRunning && remainingMs === totalSeconds * 1000 && !isFinished;
  const ready = pickerH + pickerM + pickerS > 0;

  // For run mode display
  const progress = totalSeconds > 0 ? remainingMs / (totalSeconds * 1000) : 1;
  const remSec = Math.ceil(remainingMs / 1000);
  const rh = Math.floor(remSec / 3600);
  const rm = Math.floor((remSec % 3600) / 60);
  const rs = remSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const displayTime = rh > 0
    ? `${pad(rh)}:${pad(rm)}:${pad(rs)}`
    : `${pad(rm)}:${pad(rs)}`;
  const pct = totalSeconds > 0
    ? Math.round((1 - remainingMs / (totalSeconds * 1000)) * 100)
    : 0;

  // Alert time pill
  const alertDate = new Date(Date.now() + remainingMs);
  const alertStr = `${alertDate.getHours()}:${String(alertDate.getMinutes()).padStart(2, '0')}`;

  const handleStart = () => {
    if (!ready) return;
    startWithDuration(pickerH * 3600 + pickerM * 60 + pickerS);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ScreenHeader
        title="Таймер"
        right={
          <Text style={[styles.headerStatus, {
            color: isRunning ? colors.start : colors.textMuted,
            fontFamily: FONT_FAMILY.regular,
          }]}>
            {isIdle ? 'Налаштування' : isRunning ? 'Зворотний відлік' : 'Пауза'}
          </Text>
        }
      />

      {isIdle ? (
        /* ── Picker mode ── */
        <View style={styles.flex}>
          {/* Wheel row */}
          <View style={styles.wheelRow}>
            <Wheel label="Год" value={pickerH} max={23} onChange={setPickerH} />
            <Text style={[styles.colon, { color: colors.textDim }]}>:</Text>
            <Wheel label="Хв" value={pickerM} max={59} onChange={setPickerM} />
            <Text style={[styles.colon, { color: colors.textDim }]}>:</Text>
            <Wheel label="Сек" value={pickerS} max={59} onChange={setPickerS} />
          </View>

          {/* Presets */}
          <View style={styles.presetsWrapper}>
            <Text style={[styles.presetsLabel, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
              Швидкий вибір
            </Text>
            <View style={styles.presetsGrid}>
              {PRESETS.map((p) => {
                const isActive = p.h === pickerH && p.m === pickerM && p.s === pickerS;
                return (
                  <TouchableOpacity
                    key={p.l}
                    onPress={() => { setPickerH(p.h); setPickerM(p.m); setPickerS(p.s); }}
                    activeOpacity={0.7}
                    style={[
                      styles.preset,
                      {
                        backgroundColor: isActive ? colors.surface3 : colors.surface,
                        borderColor: isActive ? colors.text : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.presetLabel, { color: colors.text, fontFamily: FONT_FAMILY.medium }]}>
                      {p.l}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.flex} />

          {/* Buttons */}
          <View style={[styles.btnRow, { borderTopColor: colors.borderSoft }]}>
            <View style={[styles.btnSide, { alignItems: 'flex-end' }]}>
              <SideButton
                label="Очистити"
                onPress={() => { setPickerH(0); setPickerM(0); setPickerS(0); }}
                disabled={!ready}
              />
            </View>
            <FabButton running={false} kind="start" onPress={handleStart} disabled={!ready} />
            <View style={styles.btnSide} />
          </View>
        </View>
      ) : (
        /* ── Run mode ── */
        <View style={styles.flex}>
          <View style={styles.dialWrapper}>
            <TickDial frac={progress} size={300}>
              <View style={styles.dialCenter}>
                <Text style={[styles.dialHint, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
                  Залишилось
                </Text>
                <Text style={[styles.dialTime, { color: isFinished ? colors.start : colors.text }]}>
                  {isFinished ? 'Час вийшов!' : displayTime}
                </Text>
                {!isFinished && (
                  <Text style={[styles.dialPct, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
                    {pct}% / 100%
                  </Text>
                )}
              </View>
            </TickDial>

            {/* Alert time pill */}
            {!isFinished && (
              <View style={[styles.alertPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.alertText, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
                  🔔 Сповіщення о {alertStr}
                </Text>
              </View>
            )}
          </View>

          {/* Buttons */}
          <View style={[styles.btnRow, { borderTopColor: colors.borderSoft }]}>
            <View style={[styles.btnSide, { alignItems: 'flex-end' }]}>
              <SideButton label="Скидання" onPress={reset} />
            </View>
            {isFinished ? (
              <FabButton running={false} kind="start" onPress={reset} />
            ) : (
              <FabButton running={isRunning} onPress={isRunning ? pause : start} />
            )}
            <View style={styles.btnSide} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1, flexDirection: 'column' },

  headerStatus: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },

  // Wheel
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 24,
    gap: 6,
  },
  wheel: {
    width: 86,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wheelHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 58, // (190 - 64) / 2 ≈ 63 → adjust for label space
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
  },
  wheelAboveBelow: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wheelDim: { fontSize: 22, fontWeight: '300', fontVariant: ['tabular-nums'] },
  wheelSelected: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  wheelValue: { fontSize: 44, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  wheelLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 6,
    fontWeight: '600',
  },
  colon: { fontSize: 48, fontWeight: '200', marginBottom: 20 },

  // Presets
  presetsWrapper: { paddingHorizontal: 24, paddingBottom: 8 },
  presetsLabel: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetLabel: { fontSize: 14, letterSpacing: 0.5 },

  // Run mode
  dialWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  dialCenter: { alignItems: 'center', gap: 6 },
  dialHint: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  dialTime: { fontSize: 52, fontWeight: '200', letterSpacing: -2, lineHeight: 56, fontVariant: ['tabular-nums'] },
  dialPct: { fontSize: 12, letterSpacing: 1, marginTop: 4 },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  alertText: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  btnSide: { flex: 1 },
});
