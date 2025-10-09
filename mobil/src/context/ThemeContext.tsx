import React, { createContext, useContext, useEffect } from "react";
import { useThemeStore } from "../store/themeStore";
import { Theme } from "../types/theme";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: "light" | "dark") => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { mode, theme, toggleTheme, setTheme } = useThemeStore();

  const isDark = mode === "dark";

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
