import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    background: string;
    backgroundSecondary: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    tabBarBackground: string;
    tabBarBorder: string;
  };
  fonts: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
    mono: string;
  };
}

const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    background: '#000000',
    backgroundSecondary: '#000000',
    cardBackground: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    border: '#38383A',
    tabBarBackground: '#000000',
    tabBarBorder: '#38383A',
  },
  fonts: {
    regular: '"MoMo Trust Display", -apple-system, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    medium: '"MoMo Trust Display", -apple-system, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    semibold: '"MoMo Trust Display", -apple-system, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    bold: '"MoMo Trust Display", -apple-system, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ACCENT_COLOR_KEY = '@app_accent_color';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColorState] = useState<string>('#007AFF');
  const isDark = true; // Force dark mode

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedAccent = localStorage.getItem(ACCENT_COLOR_KEY);
        if (savedAccent) setAccentColorState(savedAccent);
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    try {
      localStorage.setItem(ACCENT_COLOR_KEY, color);
    } catch (error) {
      console.error('Error saving accent color:', error);
    }
  };

  // Always use dark theme
  const theme: Theme = {
    ...darkTheme,
    colors: {
      ...darkTheme.colors,
      primary: accentColor,
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
