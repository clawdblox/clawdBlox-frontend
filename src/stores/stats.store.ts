import { create } from 'zustand';
import { statsApi, ApiError } from '../lib/api';
import type { StatsResponse } from '../lib/api';

interface StatsState {
  stats: StatsResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await statsApi.get();
      set({ stats, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load stats' });
    }
  },

  clearError: () => set({ error: null }),
}));
