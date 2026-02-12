import { create } from 'zustand';
import { memoryApi, ApiError } from '../lib/api';
import type { MemoryResponse, MemorySearchResultResponse, PaginationResponse, CreateMemoryInput, UpdateMemoryInput, SearchMemoryInput } from '../lib/api';

interface MemoryState {
  memories: MemoryResponse[];
  searchResults: MemorySearchResultResponse[];
  pagination: PaginationResponse | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;

  fetchMemories: (npcId: string, page?: number, limit?: number) => Promise<void>;
  searchMemories: (npcId: string, data: SearchMemoryInput) => Promise<void>;
  createMemory: (npcId: string, data: CreateMemoryInput) => Promise<MemoryResponse | null>;
  updateMemory: (npcId: string, memoryId: string, data: UpdateMemoryInput) => Promise<MemoryResponse | null>;
  deleteMemory: (npcId: string, memoryId: string) => Promise<boolean>;
  clearSearch: () => void;
  clearError: () => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  memories: [],
  searchResults: [],
  pagination: null,
  isLoading: false,
  isSearching: false,
  error: null,

  fetchMemories: async (npcId, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const data = await memoryApi.list(npcId, page, limit);
      set({ memories: data.memories, pagination: data.pagination, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load memories' });
    }
  },

  searchMemories: async (npcId, data) => {
    set({ isSearching: true, error: null });
    try {
      const result = await memoryApi.search(npcId, data);
      set({ searchResults: result.memories, isSearching: false });
    } catch (err) {
      set({ isSearching: false, error: err instanceof ApiError ? err.message : 'Search failed' });
    }
  },

  createMemory: async (npcId, data) => {
    set({ error: null });
    try {
      const { memory } = await memoryApi.create(npcId, data);
      set((s) => ({ memories: [memory, ...s.memories] }));
      return memory;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to create' });
      return null;
    }
  },

  updateMemory: async (npcId, memoryId, data) => {
    set({ error: null });
    try {
      const { memory } = await memoryApi.update(npcId, memoryId, data);
      set((s) => ({ memories: s.memories.map((m) => (m.id === memoryId ? memory : m)) }));
      return memory;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to update' });
      return null;
    }
  },

  deleteMemory: async (npcId, memoryId) => {
    set({ error: null });
    try {
      await memoryApi.delete(npcId, memoryId);
      set((s) => ({ memories: s.memories.filter((m) => m.id !== memoryId) }));
      return true;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to delete' });
      return false;
    }
  },

  clearSearch: () => set({ searchResults: [] }),
  clearError: () => set({ error: null }),
}));
