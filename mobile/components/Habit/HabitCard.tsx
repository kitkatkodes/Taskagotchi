import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { HABIT_CATEGORY_COLORS } from '@/constants/habitIcons';
import { BodyText } from '@/components/UI/PixelText';
import type { HabitWithStatus } from '@/db/database';

interface HabitCardProps {
  habit: HabitWithStatus;
  onToggle: (id: string, newState: boolean) => void;
  onLongPress?: (habit: HabitWithStatus) => void;
}

export function HabitCard({ habit, onToggle, onLongPress }: HabitCardProps) {
  const categoryColor = HABIT_CATEGORY_COLORS[habit.category as keyof typeof HABIT_CATEGORY_COLORS] ?? Colors.hotPink;
  const done = habit.completed_today;

  async function handleToggle() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(habit.id, !done);
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      onLongPress={() => onLongPress?.(habit)}
      activeOpacity={0.85}
    >
      <MotiView
        animate={{
          backgroundColor: done ? categoryColor + '22' : Colors.bgCard,
          scale: done ? 0.98 : 1,
        }}
        transition={{ type: 'spring', damping: 20 }}
        style={[styles.card, { borderColor: done ? categoryColor : Colors.candyPink }]}
      >
        {/* Category color strip */}
        <View style={[styles.strip, { backgroundColor: categoryColor }]} />

        {/* Checkbox */}
        <TouchableOpacity onPress={handleToggle} style={styles.checkboxWrapper}>
          <MotiView
            animate={{
              backgroundColor: done ? categoryColor : 'transparent',
              borderColor: done ? categoryColor : Colors.mutedText,
              scale: done ? 1.1 : 1,
            }}
            transition={{ type: 'spring', damping: 18 }}
            style={styles.checkbox}
          >
            {done && (
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <Text style={styles.checkmark}>✓</Text>
              </MotiView>
            )}
          </MotiView>
        </TouchableOpacity>

        {/* Icon + title */}
        <View style={styles.content}>
          <Text style={styles.icon}>{habit.icon}</Text>
          <View style={styles.textBlock}>
            <BodyText
              size={14}
              color={done ? Colors.mutedText : Colors.darkText}
              bold={!done}
              style={done ? styles.strikethrough : undefined}
            >
              {habit.title}
            </BodyText>
            <BodyText size={11} color={categoryColor}>
              {habit.category}
            </BodyText>
          </View>
        </View>

        {/* Completion sparkle */}
        {done && (
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            style={styles.doneSticker}
          >
            <Text style={{ fontSize: 20 }}>⭐</Text>
          </MotiView>
        )}
      </MotiView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 2,
    marginVertical: 5,
    overflow: 'hidden',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  strip: {
    width: 5,
    alignSelf: 'stretch',
  },
  checkboxWrapper: {
    padding: 14,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 10,
  },
  icon: {
    fontSize: 24,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  doneSticker: {
    paddingRight: 14,
  },
});
