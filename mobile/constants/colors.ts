export const Colors = {
  // Base palette
  candyPink: '#FADADD',
  mint: '#D9F7E8',
  sky: '#D9EEFF',
  peach: '#FFE5CF',
  lavender: '#EDE0FF',
  lemon: '#FFF9D6',
  coral: '#FFB3BA',
  teal: '#B3E5DE',

  // Vibrant accents
  hotPink: '#FF6B9D',
  brightMint: '#4ECDC4',
  sunYellow: '#FFD93D',
  violet: '#C77DFF',
  sakura: '#FF8FAB',
  skyBlue: '#74C0FC',

  // Text
  darkText: '#3D2C35',
  mutedText: '#9A7B88',
  lightText: '#F9F0F5',

  // Backgrounds
  bgPrimary: '#FFF0F5',
  bgCard: '#FFFFFF',
  bgDark: '#3D2C35',

  // Status
  healthRed: '#FF6B6B',
  energyYellow: '#FFD93D',
  xpBlue: '#74C0FC',
  streakOrange: '#FF9A3C',
  successGreen: '#51CF66',

  // Tab bar
  tabActive: '#FF6B9D',
  tabInactive: '#C4A8B0',
  tabBg: '#FFF0F5',

  // Shadows
  shadow: 'rgba(255, 107, 157, 0.2)',
  shadowDark: 'rgba(61, 44, 53, 0.15)',
} as const;

export const PetColors: Record<string, { primary: string; secondary: string; room: string }> = {
  neko: { primary: '#FFB3D1', secondary: '#FF8FAB', room: '#FFF0F5' },
  piyo: { primary: '#FFE08A', secondary: '#FFD93D', room: '#FFFBF0' },
  kuma: { primary: '#D4A574', secondary: '#C4956A', room: '#FFF5EE' },
  usagi: { primary: '#E8C4F0', secondary: '#C77DFF', room: '#F5F0FF' },
  kitsune: { primary: '#FFB347', secondary: '#FF8C00', room: '#FFF5E0' },
};
