import React, { useEffect, useCallback, useState } from 'react';
import {
  View, ScrollView, StyleSheet, Text, RefreshControl, Dimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useFocusEffect, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { PETS, type PetType, type PetMood, type EvolutionStage } from '@/constants/petData';
import { TIME_OF_DAY_LABELS } from '@/constants/habitIcons';
import { PetDisplay } from '@/components/Pet/PetDisplay';
import { HabitCard } from '@/components/Habit/HabitCard';
import { PixelText, BodyText } from '@/components/UI/PixelText';
import { KawaiiButton } from '@/components/UI/KawaiiButton';
import { useHabitStore } from '@/store/habitStore';
import { usePetStore } from '@/store/petStore';
import { useUserStore } from '@/store/userStore';
import { getTodayCompletionRate, getTodayString } from '@/db/database';

const { width: W } = Dimensions.get('window');

export default function HomeScreen() {
  const { habits, loadHabits, toggleComplete } = useHabitStore();
  const { pet, loadPet, showRewardAnimation } = usePetStore();
  const { stats, loadStats } = useUserStore();
  const [completionRate, setCompletionRate] = useState(0);
  const [rewardText, setRewardText] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadHabits();
      loadPet();
      loadStats();
      setCompletionRate(getTodayCompletionRate());

      // Redirect to onboarding if not done
      if (stats && stats.onboarding_done === 0) {
        router.replace('/onboarding');
      }
    }, [stats?.onboarding_done])
  );

  // Check onboarding on first load
  useEffect(() => {
    const s = stats;
    if (s && s.onboarding_done === 0) {
      router.replace('/onboarding');
    }
  }, []);

  function handleToggle(habitId: string, newState: boolean) {
    const result = toggleComplete(habitId, newState);
    loadPet();
    setCompletionRate(getTodayCompletionRate());

    if (result && newState) {
      setRewardText(`+${result.xp} XP  🪙 +${result.coins}`);
      setTimeout(() => setRewardText(''), 2000);
    }
  }

  if (!pet) return null;

  const petDef = PETS[pet.pet_type as PetType] ?? PETS.neko;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Group habits by time of day
  const sections = ['morning', 'afternoon', 'evening', 'anytime'] as const;
  const grouped = sections.reduce((acc, tod) => {
    acc[tod] = habits.filter(h => h.time_of_day === tod);
    return acc;
  }, {} as Record<string, typeof habits>);

  const totalToday = habits.length;
  const doneToday = habits.filter(h => h.completed_today).length;

  return (
    <View style={styles.root}>
      {/* Floating reward popup */}
      <AnimatePresence>
        {rewardText !== '' && (
          <MotiView
            from={{ opacity: 0, translateY: 20, scale: 0.8 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -30 }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.rewardPopup}
          >
            <Text style={styles.rewardText}>✨ {rewardText}</Text>
          </MotiView>
        )}
      </AnimatePresence>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <PixelText size={9} color={Colors.mutedText}>{today}</PixelText>
            <PixelText size={13} color={Colors.hotPink}>Good day! 🌸</PixelText>
          </View>
          <View style={styles.streakBadge}>
            <Text style={{ fontSize: 18 }}>🔥</Text>
            <BodyText size={16} color={Colors.streakOrange} bold>
              {stats?.current_streak ?? 0}
            </BodyText>
          </View>
        </View>

        {/* Progress banner */}
        {totalToday > 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.progressBanner, { backgroundColor: completionRate >= 80 ? Colors.mint : Colors.candyPink }]}
          >
            <BodyText size={15} bold color={Colors.darkText}>
              {doneToday}/{totalToday} habits done today
            </BodyText>
            <BodyText size={12} color={Colors.mutedText}>
              {completionRate >= 100
                ? '🎉 Perfect day!'
                : completionRate >= 50
                  ? '😊 Great progress!'
                  : '💪 Keep going!'}
            </BodyText>
          </MotiView>
        )}

        {/* Pet */}
        <PetDisplay
          petType={pet.pet_type as PetType}
          petName={pet.pet_name}
          health={pet.health}
          energy={pet.energy}
          mood={pet.mood as PetMood}
          evolutionStage={pet.evolution_stage as EvolutionStage}
          xp={pet.total_xp}
          coins={pet.coins}
        />

        {/* Today's habits */}
        <View style={styles.habitsSection}>
          <View style={styles.sectionHeader}>
            <PixelText size={10} color={Colors.darkText}>Today's habits</PixelText>
            <KawaiiButton
              label="+ Add"
              onPress={() => router.push('/(tabs)/habits')}
              size="sm"
              color={Colors.hotPink}
            />
          </View>

          {totalToday === 0 ? (
            <EmptyHabits />
          ) : (
            sections.map((tod) => {
              const sectionHabits = grouped[tod];
              if (sectionHabits.length === 0) return null;
              return (
                <View key={tod} style={styles.timeSection}>
                  <BodyText size={12} color={Colors.mutedText} style={styles.timeSectionLabel}>
                    {TIME_OF_DAY_LABELS[tod]}
                  </BodyText>
                  {sectionHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onToggle={handleToggle}
                    />
                  ))}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

function EmptyHabits() {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.emptyState}
    >
      <Text style={{ fontSize: 48 }}>🌱</Text>
      <PixelText size={9} color={Colors.mutedText} center style={{ marginTop: 10 }}>
        No habits yet!
      </PixelText>
      <BodyText size={13} color={Colors.mutedText} center style={{ marginTop: 6 }}>
        Tap Habits tab to add your first habit
      </BodyText>
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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.peach,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Colors.streakOrange,
  },
  progressBanner: {
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  habitsSection: {
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeSection: {
    marginBottom: 10,
  },
  timeSectionLabel: {
    marginBottom: 6,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.candyPink,
    borderStyle: 'dashed',
  },
  rewardPopup: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: Colors.sunYellow,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 100,
    shadowColor: Colors.sunYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  rewardText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkText,
  },
  bottomSpace: {
    height: 20,
  },
});
