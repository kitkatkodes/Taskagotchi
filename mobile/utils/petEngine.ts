import type { PetMood, EvolutionStage } from '@/constants/petData';
import { EVOLUTION_THRESHOLDS } from '@/constants/petData';
import { getPet, updatePet, getUserStats, updateUserStats, getTodayCompletionRate, getTodayString } from '@/db/database';

const XP_PER_COMPLETION = 10;
const COINS_PER_COMPLETION = 5;
const HEALTH_PER_COMPLETION = 5;
const ENERGY_PER_COMPLETION = 3;
const HEALTH_DECAY_RATE = 8;   // per missed day
const ENERGY_DECAY_RATE = 10;

export function computeMood(health: number, energy: number, rate: number): PetMood {
  if (rate >= 80) return 'excited';
  if (rate >= 50 && health >= 60) return 'happy';
  if (energy < 20) return 'tired';
  if (health < 30) return 'sad';
  return 'normal';
}

export function computeEvolution(streak: number): EvolutionStage {
  if (streak >= EVOLUTION_THRESHOLDS.stage3) return 3;
  if (streak >= EVOLUTION_THRESHOLDS.stage2) return 2;
  return 1;
}

export function onHabitCompleted(): { xp: number; coins: number; evolved: boolean } {
  const pet = getPet();
  const stats = getUserStats();
  const today = getTodayString();

  const newHealth = Math.min(100, pet.health + HEALTH_PER_COMPLETION);
  const newEnergy = Math.min(100, pet.energy + ENERGY_PER_COMPLETION);
  const newXp = pet.total_xp + XP_PER_COMPLETION;
  const newCoins = pet.coins + COINS_PER_COMPLETION;

  const oldEvolution = computeEvolution(stats.current_streak);
  const newEvolution = computeEvolution(stats.current_streak);
  const evolved = newEvolution > oldEvolution;

  const rate = getTodayCompletionRate();
  const mood = computeMood(newHealth, newEnergy, rate);

  updatePet({
    health: newHealth,
    energy: newEnergy,
    total_xp: newXp,
    coins: newCoins,
    mood,
    evolution_stage: newEvolution,
  });

  updateUserStats({
    total_completions: stats.total_completions + 1,
    last_completion_date: today,
  });

  return { xp: XP_PER_COMPLETION, coins: COINS_PER_COMPLETION, evolved };
}

export function onHabitUncompleted(): void {
  const pet = getPet();
  const rate = getTodayCompletionRate();
  const newHealth = Math.max(0, pet.health - HEALTH_PER_COMPLETION);
  const mood = computeMood(newHealth, pet.energy, rate);
  updatePet({ health: newHealth, mood });
}

export function applyDailyDecay(): void {
  const pet = getPet();
  const stats = getUserStats();
  const today = getTodayString();
  if (stats.last_completion_date === today) return;

  const newHealth = Math.max(10, pet.health - HEALTH_DECAY_RATE);
  const newEnergy = Math.max(10, pet.energy - ENERGY_DECAY_RATE);
  const mood = computeMood(newHealth, newEnergy, 0);
  updatePet({ health: newHealth, energy: newEnergy, mood });
}

export function updateStreak(): void {
  const stats = getUserStats();
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const rate = getTodayCompletionRate();
  if (rate < 50) return;

  let newStreak = stats.current_streak;
  if (stats.last_completion_date === yesterdayStr || stats.last_completion_date === today) {
    newStreak = stats.current_streak + (stats.last_completion_date === today ? 0 : 1);
  } else {
    newStreak = 1;
  }

  const longest = Math.max(stats.longest_streak, newStreak);
  const evolution = computeEvolution(newStreak);

  updateUserStats({
    current_streak: newStreak,
    longest_streak: longest,
    last_completion_date: today,
  });

  updatePet({ evolution_stage: evolution });
}
