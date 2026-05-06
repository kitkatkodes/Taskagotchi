import { create } from 'zustand';
import { getUserStats, updateUserStats, type UserStats } from '@/db/database';

interface UserState {
  stats: UserStats | null;
  loadStats: () => void;
  setOnboardingDone: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  stats: null,

  loadStats: () => {
    const stats = getUserStats();
    set({ stats });
  },

  setOnboardingDone: () => {
    updateUserStats({ onboarding_done: 1 });
    const stats = getUserStats();
    set({ stats });
  },
}));
