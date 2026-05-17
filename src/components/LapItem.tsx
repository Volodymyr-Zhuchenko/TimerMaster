import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import type { LapEntry } from '@/types';
import { formatMsLap } from '@/utils/timeFormat';

function ArrowDownIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path d="M6 9l6 7 6-7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function ArrowUpIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path d="M6 15l6-7 6 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

interface Props {
  lap: LapEntry;
  isFastest: boolean;
  isSlowest: boolean;
}

export default function LapItem({ lap, isFastest, isSlowest }: Props) {
  const { colors } = useTheme();

  const timeColor = isFastest ? colors.start : isSlowest ? colors.stop : colors.text;

  return (
    <View style={[styles.row, { borderBottomColor: colors.borderSoft }]}>
      {/* # */}
      <Text style={[styles.num, { color: colors.textMuted }]}>
        {String(lap.index).padStart(2, '0')}
      </Text>

      {/* Коло */}
      <Text style={[styles.split, { color: timeColor }]}>
        {formatMsLap(lap.splitMs)}
      </Text>

      {/* Загальне */}
      <Text style={[styles.total, { color: colors.textMuted }]}>
        {formatMsLap(lap.timeMs)}
      </Text>

      {/* Indicator */}
      <View style={styles.icon}>
        {isFastest && (
          <View style={[styles.badge, { backgroundColor: `${colors.start}22` }]}>
            <ArrowDownIcon color={colors.start} />
          </View>
        )}
        {isSlowest && (
          <View style={[styles.badge, { backgroundColor: `${colors.stop}22` }]}>
            <ArrowUpIcon color={colors.stop} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  num: {
    width: 36,
    fontSize: 14,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  split: {
    flex: 1,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
  },
  total: {
    flex: 1,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  icon: {
    width: 36,
    alignItems: 'flex-end',
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
