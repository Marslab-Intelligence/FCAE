'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type DashboardTheme = 'arctic' | 'frost';

export interface ThemeOption {
  id: DashboardTheme;
  name: string;
  description: string;
  bgHex: string;
  accentHex: string;
  secondaryHex: string;
  isLight?: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'arctic',
    name: 'Pharaonic Gold',
    description: 'Deep golden olive obsidian with hieroglyphic aura',
    bgHex: '#111009',
    accentHex: '#eab308',
    secondaryHex: '#fde047',
  },
  {
    id: 'frost',
    name: 'Half White',
    description: 'Crisp, modern light mode with high contrast white & slate',
    bgHex: '#f8fafc',
    accentHex: '#2563eb',
    secondaryHex: '#0284c7',
    isLight: true,
  },
];

interface ThemeContextType {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  options: ThemeOption[];
  currentOption: ThemeOption;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DashboardTheme>('arctic');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem('dashboard_theme') as DashboardTheme;
        if (saved && (saved === 'arctic' || saved === 'frost')) {
          setThemeState(saved);
          document.documentElement.setAttribute('data-dashboard-theme', saved);
        } else {
          document.documentElement.setAttribute('data-dashboard-theme', 'arctic');
        }
      } catch {
        document.documentElement.setAttribute('data-dashboard-theme', 'arctic');
      }
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const setTheme = (newTheme: DashboardTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('dashboard_theme', newTheme);
    } catch {}
    document.documentElement.setAttribute('data-dashboard-theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'arctic' ? 'frost' : 'arctic';
    setTheme(nextTheme);
  };

  const currentOption = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, options: THEME_OPTIONS, currentOption, toggleTheme }}>
      <div className={`transition-colors duration-300 ${mounted ? '' : 'opacity-0'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useDashboardTheme must be used within a DashboardThemeProvider');
  }
  return context;
}
