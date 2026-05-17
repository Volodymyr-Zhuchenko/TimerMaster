import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { FONT_FAMILY } from '@/constants/fonts';

interface Props {
  /** Fraction remaining: 1 = full circle, 0 = empty */
  frac: number;
  size?: number;
  children?: React.ReactNode;
}

const COUNT = 60;
const HOUR_LABELS = [
  { tick: 0, label: '12' },
  { tick: 15, label: '3' },
  { tick: 30, label: '6' },
  { tick: 45, label: '9' },
];

export default function TickDial({ frac, size = 300, children }: Props) {
  const { colors } = useTheme();

  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 8;
  const rInner = rOuter - 16;
  const rInnerMajor = rOuter - 22;
  const rLabel = rOuter - 36;

  const active = Math.max(0, Math.min(COUNT, Math.round(COUNT * frac)));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: COUNT }, (_, i) => {
          const angle = (i * (360 / COUNT) - 90) * (Math.PI / 180);
          const isMajor = i % 5 === 0;
          const r2 = isMajor ? rInnerMajor : rInner;
          const x1 = cx + Math.cos(angle) * rOuter;
          const y1 = cy + Math.sin(angle) * rOuter;
          const x2 = cx + Math.cos(angle) * r2;
          const y2 = cy + Math.sin(angle) * r2;
          const isActive = i < active;
          return (
            <Line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isActive ? colors.start : colors.tickIdle}
              strokeWidth={isMajor ? 2.5 : 1.6}
              strokeLinecap="round"
              opacity={isActive ? 1 : 0.85}
            />
          );
        })}
        {HOUR_LABELS.map(({ tick, label }) => {
          const angle = (tick * 6 - 90) * (Math.PI / 180);
          const x = cx + Math.cos(angle) * rLabel;
          const y = cy + Math.sin(angle) * rLabel + 3;
          return (
            <SvgText
              key={label}
              x={x} y={y}
              textAnchor="middle"
              fill={colors.textDim}
              fontFamily={FONT_FAMILY.regular}
              fontSize={9}
              letterSpacing={1}
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </View>
    </View>
  );
}
