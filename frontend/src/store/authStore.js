import { create } from 'zustand';
import { authApi } from '../api/auth';

const readInitial = () => {
  try {
    const token = localStorage.getItem('tf_token');
    const userRaw = localStorage.getItem('tf_user');
    if (token && userRaw) {
      return { token, user: JSON.parse(userRaw) };
    }
  } catch {}
  return { token: null, user: null };
};

export const useAuthStore = create((set, get) => ({
  ...readInitial(),
  loading: false,

  hydrate: () => set(readInitial()),

  login: async (credentials) => {
    set({ loading: true });
    try {
      const { user, token } = await authApi.login(credentials);
      localStorage.setItem('tf_token', token);
      localStorage.setItem('tf_user', JSON.stringify(user));
      set({ user, token });
      return user;
    } finally {
      set({ loading: false });
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const { user, token } = await authApi.register(data);
      localStorage.setItem('tf_token', token);
      localStorage.setItem('tf_user', JSON.stringify(user));
      set({ user, token });
      return user;
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      const user = await authApi.me();
      localStorage.setItem('tf_user', JSON.stringify(user));
      set({ user });
    } catch {}
  },

  updateUser: (user) => {
    localStorage.setItem('tf_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    set({ user: null, token: null });
  },

  isAuthed: () => !!get().token,
}));
