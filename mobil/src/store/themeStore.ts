import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, Theme, lightTheme, darkTheme } from '../types/theme';

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  
  // Actions
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  getCurrentTheme: () => Theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      theme: {
        mode: 'light',
        colors: lightTheme,
      },

      toggleTheme: () => {
        const currentMode = get().mode;
        const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
        
        set({
          mode: newMode,
          theme: {
            mode: newMode,
            colors: newMode === 'light' ? lightTheme : darkTheme,
          },
        });
      },

      setTheme: (mode: ThemeMode) => {
        set({
          mode,
          theme: {
            mode,
            colors: mode === 'light' ? lightTheme : darkTheme,
          },
        });
      },

      getCurrentTheme: () => {
        return get().theme;
      },
    }),
    {
      name: 'theme-storage', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }), // Sadece mode'u persist et
    }
  )
);
