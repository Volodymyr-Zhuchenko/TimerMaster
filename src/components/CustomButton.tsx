// ============================================================
// CustomButton — перевикористовувана кнопка з трьома варіантами:
//   primary  — зелений фон, темний текст (головна дія)
//   secondary — поверхневий фон, світлий текст (допоміжна дія)
//   danger   — червоний фон (скидання, небезпечна дія)
//
// Кольори беруться з useTheme(), тому кнопка автоматично адаптується
// при перемиканні теми без будь-яких змін в коді.
// ============================================================

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FONT_FAMILY } from '@/constants/fonts';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export default function CustomButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: Props) {
  const { colors } = useTheme();

  const bgColor =
    variant === 'primary'
      ? colors.accent
      : variant === 'danger'
        ? '#C0392B'
        : colors.surface;

  // На primary фоні (зеленому) текст темний для контрасту
  const textColor = variant === 'primary' ? '#0E0F12' : colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        styles.btn,
        {
          backgroundColor: bgColor,
          borderColor: colors.border,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor, fontFamily: FONT_FAMILY.medium }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.4,
  },
});
