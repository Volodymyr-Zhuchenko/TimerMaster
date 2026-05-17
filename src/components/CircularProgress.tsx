// ============================================================
// CircularProgress — SVG-кільце з індикатором прогресу.
//
// Математика дуги (SVG arc):
//   - Кут 0° = верхня точка кола (12 год)
//   - Кут збільшується за годинниковою стрілкою
//   - polarToCartesian(angleDeg) → (x, y) на колі радіуса r
//   - path: "M startX startY A r r 0 largeArcFlag 1 endX endY"
//   - largeArcFlag = 1, якщо дуга > 180°
//   - SVG не може намалювати arc start===end (360°),
//     тому clamp endAngle ≤ 359.99 для повного кола
//
// Трек (фонове кільце) — SVG <Circle>, не потребує arc math.
// Дуга прогресу — SVG <Path> з обчисленими координатами.
// ============================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  size: number;
  strokeWidth?: number;
  /** Прогрес від 0.0 до 1.0 (1.0 = повне кільце) */
  progress: number;
  children?: React.ReactNode;
}

/** Перетворює полярні координати (кут від верху, CW) у декартові */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/** Будує рядок SVG-дуги від 0° до endAngle° */
function buildArcPath(cx: number, cy: number, r: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function CircularProgress({
  size,
  strokeWidth = 10,
  progress,
  children,
}: Props) {
  const { colors } = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  // Радіус зменшений на halfStroke, щоб дуга не виходила за межі SVG
  const r = size / 2 - strokeWidth / 2;

  const safeProgress = Math.max(0, Math.min(1, progress));
  // Clamp до 359.99 щоб уникнути SVG arc-degenerate case (start === end)
  const endAngle = safeProgress >= 0.9999 ? 359.99 : safeProgress * 360;
  const arcPath = safeProgress > 0 ? buildArcPath(cx, cy, r, endAngle) : null;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Фонове кільце */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Дуга прогресу */}
        {arcPath && (
          <Path
            d={arcPath}
            stroke={colors.accent}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      {/* Контент по центру (час, текст) */}
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
