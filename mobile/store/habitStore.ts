import { create } from 'zustand';
import { nanoid } from './nanoid';
import {
  getAllHabits, getHabitsWithTodayStatus, insertHabit, updateHabit,
  deleteHabit, logHabitCompletion, removeHabitCompletion,
  type Habit, type HabitWithStatus,
} from '@/db/database';
import { onHabitCompleted, onHabitUncompleted, updateStreak } from '@/utils/petEngine';

interface HabitState {
  habits: HabitWithStatus[];
  lastCompletedId: string | null;
  loadHabits: () => void;
  addHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'is_active' | 'sort_order'>) => void;
  editHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  toggleComplete: (habitId: string, completed: boolean) => { xp: number; coins: number; evolved: boolean } | null;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  lastCompletedId: null,

  loadHabits: () => {
    const habits = getHabitsWithTodayStatus();
    set({ habits });
  },

  addHabit: (habitData) => {
    const newHabit: Habit = {
      id: nanoid(),
      ...habitData,
      is_active: 1,
      sort_order: get().habits.length,
      created_at: new Date().toISOString(),
    };
    insertHabit(newHabit);
    get().loadHabits();
  },

  editHabit: (id, updates) => {
    updateHabit(id, updates);
    get().loadHabits();
  },

  removeHabit: (id) => {
    deleteHabit(id);
    get().loadHabits();
  },

  toggleComplete: (habitId, completed) => {
    if (completed) {
      logHabitCompletion(habitId);
      const result = onHabitCompleted();
      updateStreak();
      set({ lastCompletedId: habitId });
      get().loadHabits();
      return result;
    } else {
      removeHabitCompletion(habitId);
      onHabitUncompleted();
      set({ lastCompletedId: null });
      get().loadHabits();
      return null;
    }
  },
}));
