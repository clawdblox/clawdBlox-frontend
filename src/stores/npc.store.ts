import { create } from 'zustand';
import { npcApi, ApiError } from '../lib/api';
import type { NpcResponse, PaginationResponse, CreateNpcInput, UpdateNpcInput, GenerateNpcInput } from '../lib/api';

interface NpcState {
  npcs: NpcResponse[];
  pagination: PaginationResponse | null;
  selectedNpc: NpcResponse | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  fetchNpcs: (page?: number, limit?: number) => Promise<void>;
  fetchNpc: (id: string) => Promise<void>;
  createNpc: (data: CreateNpcInput) => Promise<NpcResponse | null>;
  generateNpc: (data: GenerateNpcInput) => Promise<NpcResponse | null>;
  updateNpc: (id: string, data: UpdateNpcInput) => Promise<NpcResponse | null>;
  deleteNpc: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSelected: () => void;
}

export const useNpcStore = create<NpcState>((set, get) => ({
  npcs: [],
  pagination: null,
  selectedNpc: null,
  isLoading: false,
  isCreating: false,
  error: null,

  fetchNpcs: async (page = 1, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const data = await npcApi.list(page, limit);
      set({ npcs: data.npcs, pagination: data.pagination, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load NPCs' });
    }
  },

  fetchNpc: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { npc } = await npcApi.get(id);
      set({ selectedNpc: npc, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load NPC' });
    }
  },

  createNpc: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const { npc } = await npcApi.create(data);
      set((s) => ({ npcs: [npc, ...s.npcs], isCreating: false }));
      return npc;
    } catch (err) {
      set({ isCreating: false, error: err instanceof ApiError ? err.message : 'Failed to create' });
      return null;
    }
  },

  generateNpc: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const { npc } = await npcApi.generate(data);
      set((s) => ({ npcs: [npc, ...s.npcs], isCreating: false }));
      return npc;
    } catch (err) {
      set({ isCreating: false, error: err instanceof ApiError ? err.message : 'Failed to generate' });
      return null;
    }
  },

  updateNpc: async (id, data) => {
    set({ error: null });
    try {
      const { npc } = await npcApi.update(id, data);
      set((s) => ({
        npcs: s.npcs.map((n) => (n.id === id ? npc : n)),
        selectedNpc: s.selectedNpc?.id === id ? npc : s.selectedNpc,
      }));
      return npc;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to update' });
      return null;
    }
  },

  deleteNpc: async (id) => {
    set({ error: null });
    try {
      await npcApi.delete(id);
      set((s) => ({
        npcs: s.npcs.filter((n) => n.id !== id),
        selectedNpc: s.selectedNpc?.id === id ? null : s.selectedNpc,
      }));
      return true;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to delete' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedNpc: null }),
}));
