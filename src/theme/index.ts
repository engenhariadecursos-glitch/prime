export const colors = {
  // Backgrounds
  bg: '#0A0A0F',
  bgSurface: '#12121A',
  bgCard: '#1A1A26',
  bgCardAlt: '#1E1E2E',
  bgModal: '#0F0F1A',

  // Primary Gold
  primary: '#C9A84C',
  primaryLight: '#E5C76B',
  primaryDark: '#A07835',
  primaryMuted: 'rgba(201,168,76,0.15)',

  // Accent Purple (Premium)
  accent: '#7C4DFF',
  accentLight: '#9C6FFF',
  accentMuted: 'rgba(124,77,255,0.15)',

  // Fasting Orange
  fasting: '#FF6B35',
  fastingLight: '#FF8B5E',
  fastingMuted: 'rgba(255,107,53,0.15)',

  // Status
  success: '#00D4AA',
  successMuted: 'rgba(0,212,170,0.15)',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#007AFF',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8B8B9E',
  textMuted: '#55556A',
  textInverse: '#0A0A0F',

  // Borders
  border: '#2A2A3A',
  borderLight: '#3A3A4E',
};

export const gradients = {
  gold: ['#C9A84C', '#E5C76B'] as string[],
  goldDark: ['#A07835', '#C9A84C'] as string[],
  purple: ['#7C4DFF', '#9C6FFF'] as string[],
  purpleDark: ['#5B2FFF', '#7C4DFF'] as string[],
  dark: ['#0A0A0F', '#12121A'] as string[],
  darkSurface: ['#12121A', '#1A1A26'] as string[],
  fasting: ['#FF6B35', '#FF3B30'] as string[],
  fastingCool: ['#FF6B35', '#C9A84C'] as string[],
  success: ['#00D4AA', '#00A87E'] as string[],
  ketosis: ['#7C4DFF', '#FF6B35'] as string[],
  autophagy: ['#00D4AA', '#007AFF'] as string[],
  phase1: ['#FF9500', '#FF6B35'] as string[],
  phase2: ['#FF6B35', '#C9A84C'] as string[],
  phase3: ['#7C4DFF', '#5B2FFF'] as string[],
  phase4: ['#00D4AA', '#007AFF'] as string[],
  phase5: ['#C9A84C', '#E5C76B'] as string[],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 42,
  hero: 56,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const shadow = {
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  purple: {
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
};
