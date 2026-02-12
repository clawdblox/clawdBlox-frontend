import { create } from 'zustand';
import { usersApi, ApiError } from '../lib/api';
import type { UserPublicResponse, CreateUserInput, UpdateUserInput } from '../lib/api';

interface TeamState {
  members: UserPublicResponse[];
  isLoading: boolean;
  error: string | null;

  fetchMembers: () => Promise<void>;
  createMember: (data: CreateUserInput) => Promise<UserPublicResponse | null>;
  updateMember: (id: string, data: UpdateUserInput) => Promise<UserPublicResponse | null>;
  deleteMember: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { users } = await usersApi.list();
      set({ members: users, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load team' });
    }
  },

  createMember: async (data) => {
    set({ error: null });
    try {
      const { user } = await usersApi.create(data);
      set((s) => ({ members: [...s.members, user] }));
      return user;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : "Failed to create member" });
      return null;
    }
  },

  updateMember: async (id, data) => {
    set({ error: null });
    try {
      const { user } = await usersApi.update(id, data);
      set((s) => ({ members: s.members.map((m) => (m.id === id ? user : m)) }));
      return user;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to update member' });
      return null;
    }
  },

  deleteMember: async (id) => {
    set({ error: null });
    try {
      await usersApi.delete(id);
      set((s) => ({ members: s.members.filter((m) => m.id !== id) }));
      return true;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to delete member' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
