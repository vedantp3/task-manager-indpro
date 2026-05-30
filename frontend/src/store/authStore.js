import { create } from 'zustand';
import * as authApi from '../api/auth';

const TOKEN_KEY = 'tm_token';

export const useAuthStore = create((set, get) => ({
  user:      null,
  token:     null,
  isLoading: true,   // true during app-load token validation

  /**
   * Called once on app mount.
   * Reads token from localStorage, validates with /api/auth/me.
   * Clears state if invalid.
   */
  init: async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      set({ isLoading: false });
      return;
    }
    // Optimistically set the token so the axios interceptor can use it
    set({ token: stored });
    try {
      const res = await authApi.getMe();
      set({ user: res.data.data.user, token: stored, isLoading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isLoading: false });
    }
  },

  /**
   * Login — stores token in localStorage + state.
   */
  login: async (email, password) => {
    const res = await authApi.login(email, password);
    const { token, user } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token });
    return user;
  },

  /**
   * Register — stores token in localStorage + state.
   */
  register: async (email, password) => {
    const res = await authApi.register(email, password);
    const { token, user } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token });
    return user;
  },

  /**
   * Logout — clears everything.
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },
}));
