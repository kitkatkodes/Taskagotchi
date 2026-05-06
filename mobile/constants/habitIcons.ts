export type HabitCategory = 'health' | 'study' | 'work' | 'personal' | 'fitness' | 'mindfulness' | 'social' | 'creative';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface HabitPreset {
  title: string;
  icon: string;
  category: HabitCategory;
  timeOfDay: TimeOfDay;
}

export const HABIT_CATEGORY_ICONS: Record<HabitCategory, string> = {
  health: '💊',
  study: '📚',
  work: '💼',
  personal: '⭐',
  fitness: '🏃',
  mindfulness: '🧘',
  social: '👥',
  creative: '🎨',
};

export const HABIT_CATEGORY_COLORS: Record<HabitCategory, string> = {
  health: '#FF6B9D',
  study: '#74C0FC',
  work: '#4ECDC4',
  personal: '#FFD93D',
  fitness: '#FF9A3C',
  mindfulness: '#C77DFF',
  social: '#51CF66',
  creative: '#FF8FAB',
};

export const PRESET_HABITS: HabitPreset[] = [
  { title: 'Drink 8 glasses of water', icon: '💧', category: 'health', timeOfDay: 'morning' },
  { title: 'Morning stretch', icon: '🧘', category: 'fitness', timeOfDay: 'morning' },
  { title: 'Read for 20 minutes', icon: '📖', category: 'study', timeOfDay: 'evening' },
  { title: 'Meditate', icon: '🌸', category: 'mindfulness', timeOfDay: 'morning' },
  { title: 'Exercise', icon: '💪', category: 'fitness', timeOfDay: 'morning' },
  { title: 'Journal', icon: '📝', category: 'personal', timeOfDay: 'evening' },
  { title: 'Take vitamins', icon: '💊', category: 'health', timeOfDay: 'morning' },
  { title: 'No social media before noon', icon: '📵', category: 'personal', timeOfDay: 'morning' },
  { title: 'Practice gratitude', icon: '🙏', category: 'mindfulness', timeOfDay: 'evening' },
  { title: 'Cook a healthy meal', icon: '🥗', category: 'health', timeOfDay: 'afternoon' },
  { title: 'Go for a walk', icon: '🚶', category: 'fitness', timeOfDay: 'anytime' },
  { title: 'Study / work deep focus', icon: '🎯', category: 'study', timeOfDay: 'morning' },
];

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
  anytime: '⭐ Anytime',
};

export const TIME_OF_DAY_HOURS: Record<TimeOfDay, { start: number; end: number }> = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 17 },
  evening: { start: 17, end: 22 },
  anytime: { start: 0, end: 23 },
};
