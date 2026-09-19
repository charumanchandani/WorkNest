import React, { useEffect, useState, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  // Theme mode preference: 'light' | 'dark' | 'system'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('worknest_theme_mode');
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
      return savedMode;
    }
    const legacyTheme = localStorage.getItem('worknest_theme');
    if (legacyTheme === 'light' || legacyTheme === 'dark') {
      return legacyTheme;
    }
    return 'system';
  });

  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  // Effective resolved theme: 'light' | 'dark'
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (mode === 'system') {
      return getSystemTheme();
    }
    return mode;
  });

  // Apply class to document root
  useEffect(() => {
    const effective = mode === 'system' ? getSystemTheme() : mode;
    setResolvedTheme(effective);

    const root = document.documentElement;
    if (effective === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('worknest_theme_mode', mode);
    localStorage.setItem('worknest_theme', effective);
  }, [mode, getSystemTheme]);

  // Listen to OS system theme changes if mode === 'system'
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('worknest_theme', newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setThemeMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark' || newMode === 'system') {
      setMode(newMode);
    }
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setMode(newTheme);
    }
  };

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        mode,
        setThemeMode,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
