import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { HABIT_CATEGORY_COLORS, HABIT_CATEGORY_ICONS, TIME_OF_DAY_LABELS, type HabitCategory } from '@/constants/habitIcons';
import { HabitCard } from '@/components/Habit/HabitCard';
import { AddHabitModal } from '@/components/Habit/AddHabitModal';
import { KawaiiButton } from '@/components/UI/KawaiiButton';
import { PixelText, BodyText } from '@/components/UI/PixelText';
import { useHabitStore } from '@/store/habitStore';
import type { HabitWithStatus } from '@/db/database';

type FilterTab = 'all' | HabitCategory;

export default function HabitsScreen() {
  const { habits, loadHabits, addHabit, removeHabit, toggleComplete } = useHabitStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selectedHabit, setSelectedHabit] = useState<HabitWithStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const filtered = filter === 'all'
    ? habits
    : habits.filter(h => h.category === filter);

  function handleLongPress(habit: HabitWithStatus) {
    setSelectedHabit(habit);
    Alert.alert(
      `${habit.icon} ${habit.title}`,
      'What do you want to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🗑️ Delete habit',
          style: 'destructive',
          onPress: () => {
            removeHabit(habit.id);
            setSelectedHabit(null);
          },
        },
      ]
    );
  }

  const doneCount = habits.filter(h => h.completed_today).length;
  const totalCount = habits.length;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <PixelText size={12} color={Colors.hotPink}>My Habits</PixelText>
          <KawaiiButton
            label="+ New"
            onPress={() => setShowModal(true)}
            size="sm"
            icon="✨"
          />
        </View>

        {/* Summary */}
        {totalCount > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.summaryCard}
          >
            <View style={styles.summaryRow}>
              <SummaryChip icon="✅" value={doneCount} label="Done today" color={Colors.successGreen} />
              <SummaryChip icon="📋" value={totalCount} label="Total habits" color={Colors.skyBlue} />
              <SummaryChip
                icon="📈"
                value={`${totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%`}
                label="Today's rate"
                color={Colors.violet}
              />
            </View>
          </MotiView>
        )}

        {/* Category filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <FilterChip label="All" value="all" active={filter === 'all'} onPress={() => setFilter('all')} />
          {(Object.keys(HABIT_CATEGORY_ICONS) as HabitCategory[]).map((cat) => (
            <FilterChip
              key={cat}
              label={`${HABIT_CATEGORY_ICONS[cat]} ${cat}`}
              value={cat}
              active={filter === cat}
              onPress={() => setFilter(cat)}
              color={HABIT_CATEGORY_COLORS[cat]}
            />
          ))}
        </ScrollView>

        {/* Habit list */}
        <AnimatePresence>
          {filtered.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            filtered.map((habit, i) => (
              <MotiView
                key={habit.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 20 }}
                transition={{ delay: i * 40, type: 'spring', damping: 20 }}
              >
                <HabitCard
                  habit={habit}
                  onToggle={(id, state) => {
                    toggleComplete(id, state);
                  }}
                  onLongPress={handleLongPress}
                />
              </MotiView>
            ))
          )}
        </AnimatePresence>

        {/* Tips */}
        {totalCount > 0 && (
          <View style={styles.tipCard}>
            <Text style={{ fontSize: 16 }}>💡</Text>
            <BodyText size={12} color={Colors.mutedText} style={{ flex: 1 }}>
              Long-press any habit to delete it.
            </BodyText>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <AddHabitModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addHabit}
      />
    </View>
  );
}

function FilterChip({
  label, value, active, onPress, color = Colors.hotPink,
}: {
  label: string; value: string; active: boolean; onPress: () => void; color?: string;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <MotiView
        animate={{
          backgroundColor: active ? color : Colors.bgCard,
          borderColor: active ? color : Colors.candyPink,
        }}
        transition={{ type: 'spring', damping: 20 }}
        style={styles.filterChip}
      >
        <BodyText size={12} color={active ? '#fff' : Colors.darkText} bold={active}>
          {label}
        </BodyText>
      </MotiView>
    </TouchableOpacity>
  );
}

function SummaryChip({ icon, value, label, color }: {
  icon: string; value: number | string; label: string; color: string;
}) {
  return (
    <View style={[styles.summaryChip, { borderColor: color }]}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <BodyText size={18} color={color} bold center>{String(value)}</BodyText>
      <BodyText size={10} color={Colors.mutedText} center>{label}</BodyText>
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.emptyState}
    >
      <Text style={{ fontSize: 52 }}>🌱</Text>
      <PixelText size={9} color={Colors.mutedText} center style={{ marginTop: 12 }}>
        No habits yet!
      </PixelText>
      <BodyText size={13} color={Colors.mutedText} center style={{ marginVertical: 10 }}>
        Start small — even one habit per day makes a difference.
      </BodyText>
      <KawaiiButton label="Add first habit" icon="🌸" onPress={onAdd} size="md" />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.candyPink,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryChip: {
    alignItems: 'center',
    gap: 2,
    padding: 10,
    borderRadius: 14,
    borderWidth: 2,
    minWidth: 80,
  },
  filterScroll: {
    marginHorizontal: -4,
  },
  filterChip: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginHorizontal: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 36,
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.candyPink,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.lemon,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
});
