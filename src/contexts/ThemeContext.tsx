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

const lightTheme: Theme = {
  colors: {
    primary: '#000000',
    secondary: '#5856D6',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    background: '#FAFAFA',
    backgroundSecondary: '#FFFFFF',
    cardBackground: '#FFFFFF',
    text: '#000000',
    textSecondary: '#999999',
    border: '#E5E5E5',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E5E5',
  },
  fonts: {
    regular: 'system-ui, -apple-system, sans-serif',
    medium: 'system-ui, -apple-system, sans-serif',
    semibold: 'system-ui, -apple-system, sans-serif',
    bold: 'system-ui, -apple-system, sans-serif',
    mono: 'Courier New, monospace',
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    cardBackground: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    border: '#38383A',
    tabBarBackground: '#1C1C1E',
    tabBarBorder: '#38383A',
  },
  fonts: {
    regular: 'system-ui, -apple-system, sans-serif',
    medium: 'system-ui, -apple-system, sans-serif',
    semibold: 'system-ui, -apple-system, sans-serif',
    bold: 'system-ui, -apple-system, sans-serif',
    mono: 'Courier New, monospace',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  accentColor: string;
  themeMode: 'light' | 'dark' | 'auto';
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ACCENT_COLOR_KEY = '@app_accent_color';
const THEME_MODE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColorState] = useState<string>('#007AFF');
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isInitialized, setIsInitialized] = useState(false);

  // Detect system color scheme
  const getSystemColorScheme = (): 'light' | 'dark' => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedAccent = localStorage.getItem(ACCENT_COLOR_KEY);
        const savedMode = localStorage.getItem(THEME_MODE_KEY);
        
        if (savedAccent) setAccentColorState(savedAccent);
        if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
          setThemeModeState(savedMode as 'light' | 'dark' | 'auto');
        }
        
        // Set initial color scheme
        const initialScheme = savedMode === 'auto' ? getSystemColorScheme() : (savedMode as 'light' | 'dark' || 'light');
        setColorScheme(initialScheme);
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
      setIsInitialized(true);
    };
    loadPreferences();
  }, []);

  // Listen to system theme changes when mode is 'auto'
  useEffect(() => {
    if (themeMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setColorScheme(e.matches ? 'dark' : 'light');
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Legacy browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [themeMode]);

  const getIsDark = (): boolean => {
    if (themeMode === 'light') return false;
    if (themeMode === 'dark') return true;
    return colorScheme === 'dark';
  };

  const isDark = getIsDark();

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const setThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    setThemeModeState(mode);
    if (mode === 'auto') {
      setColorScheme(getSystemColorScheme());
    } else {
      setColorScheme(mode);
    }
    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    try {
      localStorage.setItem(ACCENT_COLOR_KEY, color);
    } catch (error) {
      console.error('Error saving accent color:', error);
    }
  };

  // Don't block rendering - show default theme while loading
  const baseTheme = isDark ? darkTheme : lightTheme;
  const theme: Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: accentColor,
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, accentColor, themeMode, toggleTheme, setThemeMode, setAccentColor }}>
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
