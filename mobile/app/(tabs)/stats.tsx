import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { MotiView } from 'moti';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { PETS, type PetType, type EvolutionStage } from '@/constants/petData';
import { PixelText, BodyText } from '@/components/UI/PixelText';
import { ProgressBar, StatChip } from '@/components/UI/ProgressBar';
import { usePetStore } from '@/store/petStore';
import { useUserStore } from '@/store/userStore';
import { useHabitStore } from '@/store/habitStore';
import { getCompletionHistory, getTodayString } from '@/db/database';
import { EVOLUTION_THRESHOLDS } from '@/constants/petData';

export default function StatsScreen() {
  const { pet, loadPet } = usePetStore();
  const { stats, loadStats } = useUserStore();
  const { habits, loadHabits } = useHabitStore();

  useFocusEffect(
    useCallback(() => {
      loadPet();
      loadStats();
      loadHabits();
    }, [])
  );

  if (!pet || !stats) return null;

  const petDef = PETS[pet.pet_type as PetType] ?? PETS.neko;
  const history = getCompletionHistory(30);
  const totalHabits = habits.length;

  // Next evolution info
  const currentStreak = stats.current_streak;
  const nextThreshold = currentStreak < EVOLUTION_THRESHOLDS.stage2
    ? EVOLUTION_THRESHOLDS.stage2
    : currentStreak < EVOLUTION_THRESHOLDS.stage3
      ? EVOLUTION_THRESHOLDS.stage3
      : null;
  const evolutionProgress = nextThreshold
    ? Math.round((currentStreak / nextThreshold) * 100)
    : 100;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <PixelText size={12} color={Colors.hotPink}>Your Stats</PixelText>

        {/* Key stats row */}
        <View style={styles.statsGrid}>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0, type: 'spring' }}
            style={styles.statGridItem}
          >
            <StatChip icon="🔥" value={stats.current_streak} label="Streak" color={Colors.streakOrange} />
          </MotiView>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 80, type: 'spring' }}
            style={styles.statGridItem}
          >
            <StatChip icon="✨" value={pet.total_xp} label="Total XP" color={Colors.skyBlue} />
          </MotiView>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 160, type: 'spring' }}
            style={styles.statGridItem}
          >
            <StatChip icon="✅" value={stats.total_completions} label="Done" color={Colors.successGreen} />
          </MotiView>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 240, type: 'spring' }}
            style={styles.statGridItem}
          >
            <StatChip icon="🏆" value={stats.longest_streak} label="Best" color={Colors.violet} />
          </MotiView>
        </View>

        {/* Pet card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100, type: 'spring' }}
          style={[styles.card, { borderColor: petDef.color }]}
        >
          <View style={styles.petCardRow}>
            <Text style={{ fontSize: 52 }}>{petDef.idleEmoji}</Text>
            <View style={styles.petCardInfo}>
              <PixelText size={10} color={petDef.color}>{pet.pet_name}</PixelText>
              <BodyText size={12} color={Colors.mutedText}>
                {petDef.evolutionNames[pet.evolution_stage - 1]}
              </BodyText>
              <View style={styles.coinRow}>
                <Text>🪙</Text>
                <BodyText size={13} color={Colors.sunYellow} bold>{pet.coins} coins</BodyText>
              </View>
            </View>
          </View>

          {/* Evolution progress */}
          {nextThreshold && (
            <View style={styles.evolutionSection}>
              <View style={styles.evolutionLabelRow}>
                <BodyText size={11} color={Colors.mutedText}>Evolution progress</BodyText>
                <BodyText size={11} color={petDef.color} bold>
                  {currentStreak}/{nextThreshold} day streak
                </BodyText>
              </View>
              <ProgressBar
                value={evolutionProgress}
                color={petDef.color}
                bgColor={petDef.bgColor}
                height={10}
              />
              <BodyText size={10} color={Colors.mutedText} style={{ marginTop: 4 }}>
                Keep your streak going to evolve {pet.pet_name}! ✨
              </BodyText>
            </View>
          )}
          {!nextThreshold && (
            <View style={styles.maxEvolution}>
              <Text style={{ fontSize: 20 }}>🏆</Text>
              <BodyText size={12} color={petDef.color} bold>Max evolution reached!</BodyText>
            </View>
          )}
        </MotiView>

        {/* 30-day habit calendar */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, type: 'spring' }}
          style={styles.card}
        >
          <PixelText size={9} color={Colors.darkText} style={styles.cardTitle}>30-Day Activity</PixelText>
          <CalendarGrid history={history} totalHabits={totalHabits} />
        </MotiView>

        {/* Habit breakdown */}
        {habits.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, type: 'spring' }}
            style={styles.card}
          >
            <PixelText size={9} color={Colors.darkText} style={styles.cardTitle}>Habits ({habits.length})</PixelText>
            {habits.map((habit) => {
              const completions = Object.values(history).filter(ids => ids.includes(habit.id)).length;
              const rate = totalHabits > 0 ? Math.round((completions / 30) * 100) : 0;
              return (
                <View key={habit.id} style={styles.habitStatRow}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>{habit.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <BodyText size={13} color={Colors.darkText} bold>{habit.title}</BodyText>
                    <ProgressBar value={rate} color={habit.color} height={6} />
                  </View>
                  <BodyText size={11} color={Colors.mutedText} style={{ marginLeft: 8 }}>
                    {completions}d
                  </BodyText>
                </View>
              );
            })}
          </MotiView>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function CalendarGrid({
  history, totalHabits,
}: {
  history: Record<string, string[]>;
  totalHabits: number;
}) {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  function getColor(date: string): string {
    const completions = history[date]?.length ?? 0;
    if (completions === 0) return Colors.candyPink + '40';
    const rate = totalHabits > 0 ? completions / totalHabits : 0;
    if (rate >= 1) return Colors.hotPink;
    if (rate >= 0.7) return Colors.hotPink + 'CC';
    if (rate >= 0.4) return Colors.hotPink + '88';
    return Colors.hotPink + '44';
  }

  return (
    <View style={calStyles.container}>
      {/* Weekday labels */}
      <View style={calStyles.weekRow}>
        {weekdays.map((d, i) => (
          <BodyText key={i} size={9} color={Colors.mutedText} center style={calStyles.weekLabel}>{d}</BodyText>
        ))}
      </View>
      {/* Day grid */}
      <View style={calStyles.grid}>
        {days.map((date) => (
          <View
            key={date}
            style={[calStyles.cell, { backgroundColor: getColor(date) }]}
          />
        ))}
      </View>
      <View style={calStyles.legendRow}>
        <BodyText size={9} color={Colors.mutedText}>Less</BodyText>
        {[0, 0.3, 0.6, 1].map((rate, i) => (
          <View
            key={i}
            style={[calStyles.legendCell, { backgroundColor: rate === 0 ? Colors.candyPink + '40' : Colors.hotPink + Math.round(rate * 200 + 55).toString(16).padStart(2, '0') }]}
          />
        ))}
        <BodyText size={9} color={Colors.mutedText}>More</BodyText>
      </View>
    </View>
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
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  statGridItem: {
    width: '47%',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.candyPink,
    gap: 12,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    marginBottom: 4,
  },
  petCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  petCardInfo: {
    flex: 1,
    gap: 4,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  evolutionSection: {
    gap: 6,
  },
  evolutionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  maxEvolution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.lemon,
    borderRadius: 12,
    padding: 10,
  },
  habitStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
});

const calStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  weekLabel: {
    width: 36,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  legendCell: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});
