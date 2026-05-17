// ============================================================
// LapItem — один рядок у списку кіл секундоміра.
//
// Колонки: "Коло N" | час сплітування | загальний час.
// Перше коло (isFirst=true) підсвічується акцентним кольором —
// це завжди поточне (останнє додане) коло у списку.
// ============================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { LapEntry } from '@/types';
import { formatMs } from '@/utils/timeFormat';
import { FONT_FAMILY } from '@/constants/fonts';

interface Props {
  lap: LapEntry;
  /** true для першого елемента FlatList (найновіше коло) */
  isFirst: boolean;
}

export default function LapItem({ lap, isFirst }: Props) {
  const { colors } = useTheme();
  const labelColor = isFirst ? colors.accent : colors.textMuted;

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.index, { color: labelColor, fontFamily: FONT_FAMILY.regular }]}>
        Коло {lap.index}
      </Text>
      <Text style={[styles.split, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
        {formatMs(lap.splitMs)}
      </Text>
      <Text style={[styles.total, { color: colors.text, fontFamily: FONT_FAMILY.regular }]}>
        {formatMs(lap.timeMs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  index: {
    flex: 1,
    fontSize: 13,
  },
  split: {
    flex: 1.5,
    fontSize: 13,
    textAlign: 'center',
  },
  total: {
    flex: 1.5,
    fontSize: 13,
    textAlign: 'right',
  },
});
