export type PetType = 'neko' | 'piyo' | 'kuma' | 'usagi' | 'kitsune';
export type PetMood = 'happy' | 'normal' | 'sad' | 'tired' | 'excited';
export type EvolutionStage = 1 | 2 | 3;

export interface PetDefinition {
  id: PetType;
  name: string;
  description: string;
  emoji: string[];        // [stage1, stage2, stage3]
  idleEmoji: string;
  sadEmoji: string;
  happyEmoji: string;
  tiredEmoji: string;
  excitedEmoji: string;
  color: string;
  bgColor: string;
  evolutionNames: [string, string, string];
}

export const PETS: Record<PetType, PetDefinition> = {
  neko: {
    id: 'neko',
    name: 'Neko',
    description: 'A fluffy little cat who loves cuddles and naps.',
    emoji: ['🐱', '😺', '😸'],
    idleEmoji: '🐱',
    sadEmoji: '😿',
    happyEmoji: '😸',
    tiredEmoji: '🙀',
    excitedEmoji: '😹',
    color: '#FF8FAB',
    bgColor: '#FFF0F5',
    evolutionNames: ['Neko Baby', 'Neko Chan', 'Neko Master'],
  },
  piyo: {
    id: 'piyo',
    name: 'Piyo',
    description: 'A chirpy little chick bursting with energy.',
    emoji: ['🐣', '🐥', '🐦'],
    idleEmoji: '🐥',
    sadEmoji: '🐦',
    happyEmoji: '🐣',
    tiredEmoji: '🦆',
    excitedEmoji: '🦜',
    color: '#FFD93D',
    bgColor: '#FFFBF0',
    evolutionNames: ['Piyo Egg', 'Piyo Chan', 'Piyo Master'],
  },
  kuma: {
    id: 'kuma',
    name: 'Kuma',
    description: 'A gentle bear who loves honey and long walks.',
    emoji: ['🐻', '🐨', '🦊'],
    idleEmoji: '🐻',
    sadEmoji: '🐻',
    happyEmoji: '🐨',
    tiredEmoji: '😴',
    excitedEmoji: '🦊',
    color: '#D4A574',
    bgColor: '#FFF5EE',
    evolutionNames: ['Kuma Cub', 'Kuma Bear', 'Kuma King'],
  },
  usagi: {
    id: 'usagi',
    name: 'Usagi',
    description: 'A magical bunny with sparkly dreams.',
    emoji: ['🐰', '🐇', '🦄'],
    idleEmoji: '🐰',
    sadEmoji: '🐇',
    happyEmoji: '🐰',
    tiredEmoji: '😪',
    excitedEmoji: '🦄',
    color: '#C77DFF',
    bgColor: '#F5F0FF',
    evolutionNames: ['Usagi Kit', 'Usagi Chan', 'Usagi Sage'],
  },
  kitsune: {
    id: 'kitsune',
    name: 'Kitsune',
    description: 'A clever fox spirit with many tails of wisdom.',
    emoji: ['🦊', '🦊', '✨'],
    idleEmoji: '🦊',
    sadEmoji: '🦝',
    happyEmoji: '🦊',
    tiredEmoji: '😴',
    excitedEmoji: '✨',
    color: '#FFB347',
    bgColor: '#FFF5E0',
    evolutionNames: ['Kitsune Pup', 'Kitsune Fox', 'Kitsune Spirit'],
  },
};

export const EVOLUTION_THRESHOLDS = {
  stage2: 7,   // 7-day streak
  stage3: 21,  // 21-day streak
};

export function getPetEmoji(pet: PetDefinition, mood: PetMood, stage: EvolutionStage): string {
  switch (mood) {
    case 'happy':
    case 'excited':
      return pet.happyEmoji;
    case 'sad':
      return pet.sadEmoji;
    case 'tired':
      return pet.tiredEmoji;
    default:
      return pet.emoji[stage - 1] ?? pet.idleEmoji;
  }
}
