import { create } from 'zustand';

const getInitial = () => {
  const stored = localStorage.getItem('tf_theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create((set, get) => ({
  theme: getInitial(),
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tf_theme', next);
    set({ theme: next });
    get().apply(next);
  },
  apply: (theme) => {
    const t = theme || get().theme;
    document.documentElement.classList.toggle('dark', t === 'dark');
  },
}));
