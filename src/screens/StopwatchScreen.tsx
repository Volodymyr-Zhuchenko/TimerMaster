import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useTheme } from '@/hooks/useTheme';
import ScreenHeader from '@/components/ScreenHeader';
import LapItem from '@/components/LapItem';
import { FabButton, SideButton } from '@/components/CustomButton';
import { formatMsDisplay, formatMsLap } from '@/utils/timeFormat';
import { FONT_FAMILY } from '@/constants/fonts';

export default function StopwatchScreen() {
  const { elapsedMs, isRunning, laps, start, pause, reset, lap } = useStopwatch();
  const { colors } = useTheme();

  const { main, cents } = formatMsDisplay(elapsedMs);
  const currentLapMs = elapsedMs - (laps[0]?.timeMs ?? 0);

  // Fastest / slowest detection (only when ≥ 2 laps)
  const lapSplits = laps.map((l) => l.splitMs);
  const minSplit = lapSplits.length >= 2 ? Math.min(...lapSplits) : -1;
  const maxSplit = lapSplits.length >= 2 ? Math.max(...lapSplits) : -1;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <ScreenHeader
        title="Секундомір"
        right={
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              {
                backgroundColor: isRunning ? colors.start : colors.textMuted,
                shadowColor: isRunning ? colors.start : 'transparent',
              },
            ]} />
            <Text style={[styles.statusLabel, {
              color: isRunning ? colors.start : colors.textMuted,
              fontFamily: FONT_FAMILY.regular,
            }]}>
              {isRunning ? 'Запущено' : 'Пауза'}
            </Text>
          </View>
        }
      />

      {/* ── Big time display ── */}
      <View style={styles.timeBlock}>
        <Text style={[styles.timeLabel, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
          Загальний час
        </Text>
        <View style={styles.timeRow}>
          <Text style={[styles.timeMain, { color: colors.text }]}>
            {main}
          </Text>
          <Text style={[styles.timeCents, { color: colors.textMuted }]}>
            .{cents}
          </Text>
        </View>
        {/* Current lap pill */}
        <View style={[styles.lapPill, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
          <Text style={[styles.lapPillText, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            КОЛО {laps.length + 1} ·{' '}
            <Text style={{ color: colors.text }}>{formatMsLap(currentLapMs)}</Text>
          </Text>
        </View>
      </View>

      {/* ── Lap list ── */}
      <View style={styles.lapListWrapper}>
        {laps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
              Немає кіл
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textDim, fontFamily: FONT_FAMILY.regular }]}>
              Натисніть «Коло», щоб зафіксувати проміжний час.
            </Text>
          </View>
        ) : (
          <View style={[styles.lapCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Table header */}
            <View style={[styles.lapHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.lapHeaderNum, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>#</Text>
              <Text style={[styles.lapHeaderCell, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>Коло</Text>
              <Text style={[styles.lapHeaderCell, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>Загальне</Text>
              <View style={styles.lapHeaderIcon} />
            </View>
            <ScrollView style={styles.lapScroll} showsVerticalScrollIndicator={false}>
              {laps.map((item) => (
                <LapItem
                  key={item.id}
                  lap={item}
                  isFastest={lapSplits.length >= 2 && item.splitMs === minSplit}
                  isSlowest={lapSplits.length >= 2 && item.splitMs === maxSplit}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── Button row ── */}
      <View style={[styles.btnRow, { borderTopColor: colors.borderSoft }]}>
        <View style={[styles.btnSide, { alignItems: 'flex-end' }]}>
          <SideButton
            label="Скидання"
            onPress={reset}
            disabled={isRunning && laps.length === 0 && elapsedMs === 0}
          />
        </View>
        <FabButton
          running={isRunning}
          onPress={isRunning ? pause : start}
        />
        <View style={[styles.btnSide, { alignItems: 'flex-start' }]}>
          <SideButton
            label="Коло"
            onPress={lap}
            disabled={!isRunning}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: {
    width: 6, height: 6, borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },

  timeBlock: { paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center', gap: 8 },
  timeLabel: { fontSize: 14, letterSpacing: 3, textTransform: 'uppercase' },
  timeRow: { flexDirection: 'row', alignItems: 'baseline' },
  timeMain: { fontSize: 84, lineHeight: 84, letterSpacing: -3, fontVariant: ['tabular-nums'] },
  timeCents: { fontSize: 40, marginLeft: 4, fontVariant: ['tabular-nums'] },

  lapPill: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  lapPillText: { fontSize: 13, letterSpacing: 0.5 },

  lapListWrapper: { flex: 1, paddingHorizontal: 24 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 32 },
  emptyTitle: { fontSize: 16, marginBottom: 6 },
  emptyBody: { fontSize: 13, textAlign: 'center' },

  lapCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    flex: 1,
  },
  lapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  lapHeaderNum: { width: 36, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  lapHeaderCell: { flex: 1, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  lapHeaderIcon: { width: 36 },
  lapScroll: { flex: 1 },

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
