export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  success: string;
  danger: string;
  shadow: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
}

export type ThemeKey = 'sleekDark' | 'sunAndSoil' | 'deepOcean' | 'roseQuartzLight' | 'accessibleLight';

export const themes: Record<ThemeKey, ThemeConfig> = {
  sleekDark: {
    name: 'Sleek Dark',
    colors: {
      bg: '#0B1120',
      surface: '#131B2E',
      surface2: '#1B2540',
      border: '#263352',
      text: '#E2E8F0',
      muted: '#8B9BC2',
      accent: '#6366F1',
      accent2: '#3B82F6',
      success: '#34D399',
      danger: '#F87171',
      shadow: 'rgba(0,0,0,0.45)',
    },
  },
  sunAndSoil: {
    name: 'Sun & Soil',
    colors: {
      bg: '#FBF4E9',
      surface: '#FFFDF8',
      surface2: '#F4E9D6',
      border: '#E3D2B0',
      text: '#3B2E22',
      muted: '#8A7860',
      accent: '#C4652A',
      accent2: '#7A8B4A',
      success: '#5C7A3D',
      danger: '#B23A2E',
      shadow: 'rgba(75,53,25,0.10)',
    },
  },
  deepOcean: {
    name: 'Deep Ocean',
    colors: {
      bg: '#0E1B21',
      surface: '#16262E',
      surface2: '#1E323B',
      border: '#2A414B',
      text: '#DCE8EA',
      muted: '#7FA0A8',
      accent: '#2FA3A3',
      accent2: '#4FC3C3',
      success: '#4CAE7D',
      danger: '#E0755F',
      shadow: 'rgba(0,0,0,0.4)',
    },
  },
  roseQuartzLight: {
    name: 'Rose Quartz Light',
    colors: {
      bg: '#FBF3F5',
      surface: '#FFFFFF',
      surface2: '#F5E6EA',
      border: '#EDD3DA',
      text: '#4A2E38',
      muted: '#A17F89',
      accent: '#A64D6E',
      accent2: '#C97590',
      success: '#6B8F5A',
      danger: '#C4443F',
      shadow: 'rgba(74,46,56,0.07)',
    },
  },
  accessibleLight: {
    name: 'Accessible Light',
    colors: {
      bg: '#F7F8FA',
      surface: '#FFFFFF',
      surface2: '#F0F2F5',
      border: '#DDE2E8',
      text: '#1E293B',
      muted: '#55637A',
      accent: '#0D9488',
      accent2: '#10B981',
      success: '#0F8F5F',
      danger: '#C0362C',
      shadow: 'rgba(30,41,59,0.08)',
    },
  },
};

export const applyThemeToDocument = (themeKey: ThemeKey) => {
  const theme = themes[themeKey] || themes.sleekDark;
  const root = document.documentElement;

  root.style.setProperty('--color-bg', theme.colors.bg);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-surface2', theme.colors.surface2);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-muted', theme.colors.muted);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-accent2', theme.colors.accent2);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-danger', theme.colors.danger);
  root.style.setProperty('--color-shadow', theme.colors.shadow);
};
