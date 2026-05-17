// ============================================================
// TimeDisplay — монохромний цифровий дисплей часу у стилі TimeMaster.
// Використовує IBM Plex Mono для автентичного clock-look.
// Два розміри: large (секундомір, заголовок) і small (всередині кільця).
// ============================================================

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FONT_FAMILY } from '@/constants/fonts';

interface Props {
  time: string;
  size?: 'large' | 'small';
}

export default function TimeDisplay({ time, size = 'large' }: Props) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.base,
        { color: colors.text, fontFamily: FONT_FAMILY.light },
        size === 'large' ? styles.large : styles.small,
      ]}
    >
      {time}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: -1,
  },
  large: {
    fontSize: 44,
  },
  small: {
    fontSize: 32,
  },
});
