import { create } from 'zustand';
import { channelApi, ApiError } from '../lib/api';
import type { ChannelBindingResponse, CreateChannelBindingInput } from '../lib/api';

interface ChannelState {
  bindings: ChannelBindingResponse[];
  isLoading: boolean;
  error: string | null;

  fetchBindings: () => Promise<void>;
  createBinding: (data: CreateChannelBindingInput) => Promise<ChannelBindingResponse | null>;
  deleteBinding: (npcId: string, platform: string, platformChannelId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  bindings: [],
  isLoading: false,
  error: null,

  fetchBindings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { bindings } = await channelApi.list();
      set({ bindings, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load bindings' });
    }
  },

  createBinding: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { binding } = await channelApi.bind(data);
      set((state) => ({ bindings: [...state.bindings, binding], isLoading: false }));
      return binding;
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to create binding' });
      return null;
    }
  },

  deleteBinding: async (npcId, platform, platformChannelId) => {
    set({ isLoading: true, error: null });
    try {
      await channelApi.unbind({ npc_id: npcId, platform, platform_channel_id: platformChannelId });
      set((state) => ({
        bindings: state.bindings.filter(
          (b) => !(b.npc_id === npcId && b.platform === platform && b.platform_channel_id === platformChannelId),
        ),
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to delete binding' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
