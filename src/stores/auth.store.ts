import { create } from 'zustand';
import { authApi, setStoredApiKey, clearStoredApiKey, ApiError } from '../lib/api';
import type { UserPublicResponse } from '../lib/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  user: UserPublicResponse | null;

  login: (email: string, password: string) => Promise<boolean>;
  setup: (email: string, password: string, displayName: string, projectName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  user: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.login(email, password);
      set({ isAuthenticated: true, user, isLoading: false });
      return true;
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Failed to connect to server';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  setup: async (email, password, displayName, projectName) => {
    set({ isLoading: true, error: null });
    try {
      const { user, api_key } = await authApi.setup({
        email,
        password,
        display_name: displayName,
        project_name: projectName,
      });
      setStoredApiKey(api_key);
      set({ isAuthenticated: true, user, isLoading: false });
      return true;
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Setup failed';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    clearStoredApiKey();
    set({ isAuthenticated: false, user: null });
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const { user } = await authApi.me();
      set({ isAuthenticated: true, user, isCheckingAuth: false });
    } catch {
      set({ isAuthenticated: false, user: null, isCheckingAuth: false });
    }
  },

  clearError: () => set({ error: null }),
}));
