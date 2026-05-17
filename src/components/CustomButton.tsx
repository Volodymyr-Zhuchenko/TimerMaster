import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Polygon, Rect, Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { FONT_FAMILY } from '@/constants/fonts';

// ─── Icons ───────────────────────────────────────────────

function PlayIcon({ size = 28, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="6,3 20,12 6,21" fill={color} />
    </Svg>
  );
}

function PauseIcon({ size = 28, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="3" width="4" height="18" rx="1.5" fill={color} />
      <Rect x="15" y="3" width="4" height="18" rx="1.5" fill={color} />
    </Svg>
  );
}

// ─── FAB (88px circle — Start / Pause) ───────────────────

interface FabProps {
  running: boolean;
  onPress?: () => void;
  /** 'start' forces the play icon regardless of running */
  kind?: 'start' | 'stop';
  disabled?: boolean;
}

export function FabButton({ running, onPress, kind, disabled }: FabProps) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  const isStop = kind === 'stop' || (kind === undefined && running);
  const bg = isStop ? colors.stop : colors.start;
  const ink = isStop ? colors.stopInk : colors.startInk;

  return (
    <TouchableOpacity
      onPressIn={() => !disabled && setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
      style={[
        styles.fab,
        {
          backgroundColor: bg,
          shadowColor: bg,
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      {isStop
        ? <PauseIcon size={28} color={ink} />
        : <PlayIcon size={28} color={ink} />
      }
    </TouchableOpacity>
  );
}

// ─── SideButton (pill — Скидання / Коло / Очистити) ──────

interface SideProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function SideButton({ label, onPress, disabled }: SideProps) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableOpacity
      onPressIn={() => !disabled && setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
      style={[
        styles.side,
        {
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      <Text style={[styles.sideLabel, { color: colors.text, fontFamily: FONT_FAMILY.medium }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Legacy default export ────────────────────────────────

interface LegacyProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export default function CustomButton({ label, onPress, variant = 'primary', disabled = false }: LegacyProps) {
  const { colors } = useTheme();

  const bg = variant === 'primary' ? colors.start
    : variant === 'danger' ? colors.stop
    : 'transparent';
  const textColor = variant === 'primary' ? colors.startInk
    : variant === 'danger' ? colors.stopInk
    : colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        styles.legacy,
        { backgroundColor: bg, borderColor: colors.border, opacity: disabled ? 0.35 : 1 },
      ]}
    >
      <Text style={[styles.legacyLabel, { color: textColor, fontFamily: FONT_FAMILY.medium }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  fab: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  side: {
    width: 124,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  legacy: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  legacyLabel: {
    fontSize: 15,
  },
});
