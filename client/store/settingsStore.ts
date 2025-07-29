import { create } from 'zustand'

interface SettingsState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useSettingsStore = create<SettingsState>()((set) => {
  const storedTheme = localStorage.getItem('theme');
  const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      set({ theme });
    },
  };
});
