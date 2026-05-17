import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FONT_FAMILY } from '@/constants/fonts';

interface Props {
  subtitle?: string;
  title: string;
  right?: React.ReactNode;
}

export default function ScreenHeader({ subtitle, title, right }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <View>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
            {subtitle}
          </Text>
        )}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});
