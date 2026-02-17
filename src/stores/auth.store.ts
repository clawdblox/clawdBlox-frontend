import { create } from 'zustand';
import { authApi, projectApi, setStoredApiKey, getStoredApiKey, ApiError } from '../lib/api';
import type { UserPublicResponse } from '../lib/api';
import { useNpcStore } from './npc.store';
import { useConversationStore } from './conversation.store';
import { useMemoryStore } from './memory.store';
import { useLifeStore } from './life.store';
import { useStatsStore } from './stats.store';
import { useTeamStore } from './team.store';
import { useChannelStore } from './channel.store';
import { useProjectStore } from './project.store';

function resetAllStores() {
  useNpcStore.setState({ npcs: [], selectedNpc: null, pagination: null, error: null });
  useConversationStore.setState({ conversations: [], messages: [], pagination: null, error: null });
  useMemoryStore.setState({ memories: [], searchResults: [], pagination: null, error: null });
  useLifeStore.setState({ routines: [], goals: [], relationships: [], error: null });
  useStatsStore.setState({ stats: null, error: null });
  useTeamStore.setState({ members: [], error: null });
  useChannelStore.setState({ bindings: [], error: null });
  useProjectStore.setState({ project: null, error: null });
}

async function ensureApiKey(apiKeyFromLogin?: string) {
  // Login flow: use the key from the server response
  if (apiKeyFromLogin) {
    setStoredApiKey(apiKeyFromLogin);
    return;
  }

  // checkAuth flow: always refresh from server
  try {
    const { project } = await projectApi.get();
    if (project.api_key) {
      setStoredApiKey(project.api_key);
      return;
    }
    // api_key_encrypted is NULL in DB (legacy project) — rotate to generate one
    const { api_key } = await projectApi.rotateApiKey();
    setStoredApiKey(api_key);
  } catch {
    // Keep existing localStorage key as fallback if server is unreachable
    if (getStoredApiKey()) return;
    throw new Error('Failed to restore API key');
  }
}

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
      const { user, api_key } = await authApi.login(email, password);
      await ensureApiKey(api_key);
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
    localStorage.clear();
    resetAllStores();
    set({ isAuthenticated: false, user: null });
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const { user } = await authApi.me();
      await ensureApiKey();
      set({ isAuthenticated: true, user, isCheckingAuth: false });
    } catch {
      set({ isAuthenticated: false, user: null, isCheckingAuth: false });
    }
  },

  clearError: () => set({ error: null }),
}));
