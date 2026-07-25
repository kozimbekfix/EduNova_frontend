import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('edunova-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'dark';
};

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('edunova-theme', next);

      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return { theme: next };
    }),

  setTheme: (theme) => {
    localStorage.setItem('edunova-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('edunova-theme');
  const theme = stored || 'dark';
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

export default useThemeStore;
