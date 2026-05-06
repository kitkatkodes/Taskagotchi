import { create } from 'zustand';
import { getPet, updatePet, type PetRow } from '@/db/database';
import type { PetType } from '@/constants/petData';

interface PetState {
  pet: PetRow | null;
  showReward: boolean;
  rewardXp: number;
  rewardCoins: number;
  loadPet: () => void;
  selectPet: (type: PetType, name: string) => void;
  showRewardAnimation: (xp: number, coins: number) => void;
  hideReward: () => void;
}

export const usePetStore = create<PetState>((set) => ({
  pet: null,
  showReward: false,
  rewardXp: 0,
  rewardCoins: 0,

  loadPet: () => {
    const pet = getPet();
    set({ pet });
  },

  selectPet: (type, name) => {
    updatePet({ pet_type: type, pet_name: name });
    const pet = getPet();
    set({ pet });
  },

  showRewardAnimation: (xp, coins) => {
    set({ showReward: true, rewardXp: xp, rewardCoins: coins });
  },

  hideReward: () => {
    set({ showReward: false });
  },
}));
