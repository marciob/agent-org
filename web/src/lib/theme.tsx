'use client';

import { createContext, useContext, useEffect, useSyncExternalStore, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Storage key for theme
const THEME_KEY = 'theme';

// Custom event name for theme changes within the same tab
const THEME_CHANGE_EVENT = 'theme-change';

// Get the current theme from localStorage or system preference
function getThemeSnapshot(): Theme {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Server snapshot always returns light (default)
function getServerSnapshot(): Theme {
  return 'light';
}

// Subscribe to theme changes
function subscribeToTheme(callback: () => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    mediaQuery.removeEventListener('change', callback);
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

// Subscribe function for mounted detection
const emptySubscribe = () => () => {};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for theme - properly syncs with localStorage
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  // Use useSyncExternalStore to detect client-side hydration
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Apply theme class to document when it changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    // Dispatch custom event to trigger useSyncExternalStore re-read
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Prevent flash of wrong theme during SSR
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
