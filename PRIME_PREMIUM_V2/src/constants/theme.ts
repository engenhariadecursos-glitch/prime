// PRIME Premium V2 — Design System
export const colors = {
  // Pure black base — Apple/Tesla aesthetic
  bg: '#000000',
  surface1: '#0F0F0F',
  surface2: '#1A1A1A',
  surface3: '#252525',
  surface4: '#333333',

  // Text hierarchy
  text: '#FFFFFF',
  textSecondary: '#E5E5E7',
  muted: '#8E8E93',
  muted2: '#48484A',

  // Borders — ultra-subtle
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.14)',

  // Primary accent — premium orange
  orange: '#FF7A00',
  orange2: '#FF9500',
  orangeGlow: 'rgba(255,122,0,0.25)',
  orangeDim: 'rgba(255,122,0,0.12)',
  orangeDeep: 'rgba(255,122,0,0.06)',

  // Semantic
  green: '#30D158',
  greenDim: 'rgba(48,209,88,0.12)',
  red: '#FF453A',
  redDim: 'rgba(255,69,58,0.12)',
  blue: '#0A84FF',
  blueDim: 'rgba(10,132,255,0.12)',
  purple: '#BF5AF2',
  purpleDim: 'rgba(191,90,242,0.12)',
  yellow: '#FFD60A',
  teal: '#5AC8FA',

  // Premium metallic
  silver: '#B8B8B8',
  gold: '#D4AF37',
  goldDim: 'rgba(212,175,55,0.10)',

  // Glass morphism
  glass: 'rgba(15,15,15,0.92)',
  glassBorder: 'rgba(255,255,255,0.09)',
  glassHover: 'rgba(255,255,255,0.05)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const typography = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
  hero: 64,
};

export const shadows = {
  orange: {
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  orangeSmall: {
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  green: {
    shadowColor: '#30D158',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};
