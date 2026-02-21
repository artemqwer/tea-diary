'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeType = 'dark' | 'light' | 'green' | 'purple' | 'red' | 'blue' | 'custom';

type CustomColors = {
  accent: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  borderPrimary: string;
};

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  customColors: CustomColors;
  setCustomColors: (colors: CustomColors) => void;
};

const defaultCustomColors: CustomColors = {
  accent: '#d97706',
  bgPrimary: '#0c0a09',
  bgSecondary: '#1c1917',
  bgTertiary: '#292524',
  textPrimary: '#f5f5f4',
  textSecondary: '#a8a29e',
  borderPrimary: '#292524',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  customColors: defaultCustomColors,
  setCustomColors: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const PRESET_THEMES: ThemeType[] = ['dark', 'light', 'green', 'purple', 'red', 'blue'];

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>('dark');
  const [customColors, setCustomColorsState] = useState<CustomColors>(defaultCustomColors);

  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem('tea-diary-theme') as ThemeType | null;
    const savedColors = localStorage.getItem('tea-diary-custom-colors');

    if (saved) setThemeState(saved);
    if (savedColors) {
      try {
        setCustomColorsState(JSON.parse(savedColors));
      } catch {}
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'custom') {
      root.removeAttribute('data-theme');
      root.style.setProperty('--bg-primary', customColors.bgPrimary);
      root.style.setProperty('--bg-secondary', customColors.bgSecondary);
      root.style.setProperty('--bg-tertiary', customColors.bgTertiary);
      root.style.setProperty('--bg-card', customColors.bgSecondary);
      root.style.setProperty('--bg-input', customColors.bgPrimary);
      root.style.setProperty('--bg-hover', customColors.bgTertiary);
      root.style.setProperty('--text-primary', customColors.textPrimary);
      root.style.setProperty('--text-secondary', customColors.textSecondary);
      root.style.setProperty('--text-muted', customColors.textSecondary);
      root.style.setProperty('--border-primary', customColors.borderPrimary);
      root.style.setProperty('--border-secondary', customColors.borderPrimary);
      root.style.setProperty('--accent', customColors.accent);
      root.style.setProperty('--accent-hover', customColors.accent);
      root.style.setProperty('--accent-subtle', customColors.accent + '1a');
      root.style.setProperty('--accent-border', customColors.accent + '33');
    } else {
      // Clear inline styles
      const props = [
        '--bg-primary',
        '--bg-secondary',
        '--bg-tertiary',
        '--bg-card',
        '--bg-input',
        '--bg-hover',
        '--text-primary',
        '--text-secondary',
        '--text-muted',
        '--border-primary',
        '--border-secondary',
        '--accent',
        '--accent-hover',
        '--accent-subtle',
        '--accent-border',
      ];
      props.forEach(p => root.style.removeProperty(p));

      if (PRESET_THEMES.includes(theme) && theme !== 'dark') {
        root.setAttribute('data-theme', theme);
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }, [theme, customColors]);

  const setTheme = useCallback((t: ThemeType) => {
    setThemeState(t);
    localStorage.setItem('tea-diary-theme', t);
  }, []);

  const setCustomColors = useCallback((c: CustomColors) => {
    setCustomColorsState(c);
    localStorage.setItem('tea-diary-custom-colors', JSON.stringify(c));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColors, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
