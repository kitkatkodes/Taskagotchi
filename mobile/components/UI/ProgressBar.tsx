import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '@/constants/colors';
import { BodyText } from './PixelText';

interface ProgressBarProps {
  value: number;        // 0–100
  color?: string;
  bgColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  icon?: string;
}

export function ProgressBar({
  value,
  color = Colors.hotPink,
  bgColor = Colors.candyPink,
  height = 10,
  showLabel,
  label,
  icon,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.container}>
      {(showLabel || icon) && (
        <View style={styles.labelRow}>
          {icon && <BodyText size={12}>{icon} </BodyText>}
          {label && <BodyText size={10} color={Colors.mutedText}>{label}</BodyText>}
          <BodyText size={10} color={color} bold style={styles.valueText}>
            {clamped}%
          </BodyText>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: bgColor, borderRadius: height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              height,
              backgroundColor: color,
              borderRadius: height,
              shadowColor: color,
              shadowOpacity: 0.5,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 3,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  valueText: {
    marginLeft: 'auto',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

// Compact stat chip
interface StatChipProps {
  icon: string;
  value: number | string;
  label: string;
  color?: string;
}

export function StatChip({ icon, value, label, color = Colors.hotPink }: StatChipProps) {
  return (
    <View style={[chipStyles.chip, { borderColor: color }]}>
      <BodyText size={18} center>{icon}</BodyText>
      <BodyText size={16} color={color} bold center>{String(value)}</BodyText>
      <BodyText size={10} color={Colors.mutedText} center>{label}</BodyText>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 72,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
});
