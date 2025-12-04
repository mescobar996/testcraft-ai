"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("testcraft-theme") as Theme | null;
    if (saved && (saved === "dark" || saved === "light")) {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("testcraft-theme", theme);
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === "dark"
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
