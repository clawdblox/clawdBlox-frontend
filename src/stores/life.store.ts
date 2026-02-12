import { create } from 'zustand';
import { lifeApi, ApiError } from '../lib/api';
import type {
  RoutineResponse, GoalResponse, RelationshipResponse,
  CreateRoutineInput, UpdateRoutineInput,
  CreateGoalInput, UpdateGoalInput,
  CreateRelationshipInput, UpdateRelationshipInput,
} from '../lib/api';

interface LifeState {
  routines: RoutineResponse[];
  goals: GoalResponse[];
  relationships: RelationshipResponse[];
  isLoading: boolean;
  error: string | null;

  // Routines
  fetchRoutines: (npcId: string) => Promise<void>;
  createRoutine: (npcId: string, data: CreateRoutineInput) => Promise<RoutineResponse | null>;
  updateRoutine: (npcId: string, routineId: string, data: UpdateRoutineInput) => Promise<RoutineResponse | null>;
  deleteRoutine: (npcId: string, routineId: string) => Promise<boolean>;

  // Goals
  fetchGoals: (npcId: string) => Promise<void>;
  createGoal: (npcId: string, data: CreateGoalInput) => Promise<GoalResponse | null>;
  updateGoal: (npcId: string, goalId: string, data: UpdateGoalInput) => Promise<GoalResponse | null>;
  deleteGoal: (npcId: string, goalId: string) => Promise<boolean>;

  // Relationships
  fetchRelationships: (npcId: string) => Promise<void>;
  createRelationship: (npcId: string, data: CreateRelationshipInput) => Promise<RelationshipResponse | null>;
  updateRelationship: (npcId: string, relId: string, data: UpdateRelationshipInput) => Promise<RelationshipResponse | null>;
  deleteRelationship: (npcId: string, relId: string) => Promise<boolean>;

  clearError: () => void;
  clearAll: () => void;
}

export const useLifeStore = create<LifeState>((set) => ({
  routines: [],
  goals: [],
  relationships: [],
  isLoading: false,
  error: null,

  // ─── Routines ────────────────────────────
  fetchRoutines: async (npcId) => {
    set({ isLoading: true, error: null });
    try {
      const { routines } = await lifeApi.listRoutines(npcId);
      set({ routines, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load routines' });
    }
  },

  createRoutine: async (npcId, data) => {
    try {
      const { routine } = await lifeApi.createRoutine(npcId, data);
      set((s) => ({ routines: [...s.routines, routine] }));
      return routine;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to create routine' });
      return null;
    }
  },

  updateRoutine: async (npcId, routineId, data) => {
    try {
      const { routine } = await lifeApi.updateRoutine(npcId, routineId, data);
      set((s) => ({ routines: s.routines.map((r) => (r.id === routineId ? routine : r)) }));
      return routine;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to update routine' });
      return null;
    }
  },

  deleteRoutine: async (npcId, routineId) => {
    try {
      await lifeApi.deleteRoutine(npcId, routineId);
      set((s) => ({ routines: s.routines.filter((r) => r.id !== routineId) }));
      return true;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to delete routine' });
      return false;
    }
  },

  // ─── Goals ───────────────────────────────
  fetchGoals: async (npcId) => {
    set({ isLoading: true, error: null });
    try {
      const { goals } = await lifeApi.listGoals(npcId);
      set({ goals, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load goals' });
    }
  },

  createGoal: async (npcId, data) => {
    try {
      const { goal } = await lifeApi.createGoal(npcId, data);
      set((s) => ({ goals: [...s.goals, goal] }));
      return goal;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to create goal' });
      return null;
    }
  },

  updateGoal: async (npcId, goalId, data) => {
    try {
      const { goal } = await lifeApi.updateGoal(npcId, goalId, data);
      set((s) => ({ goals: s.goals.map((g) => (g.id === goalId ? goal : g)) }));
      return goal;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to update goal' });
      return null;
    }
  },

  deleteGoal: async (npcId, goalId) => {
    try {
      await lifeApi.deleteGoal(npcId, goalId);
      set((s) => ({ goals: s.goals.filter((g) => g.id !== goalId) }));
      return true;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to delete goal' });
      return false;
    }
  },

  // ─── Relationships ───────────────────────
  fetchRelationships: async (npcId) => {
    set({ isLoading: true, error: null });
    try {
      const { relationships } = await lifeApi.listRelationships(npcId);
      set({ relationships, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load relationships' });
    }
  },

  createRelationship: async (npcId, data) => {
    try {
      const { relationship } = await lifeApi.createRelationship(npcId, data);
      set((s) => ({ relationships: [...s.relationships, relationship] }));
      return relationship;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to create relationship' });
      return null;
    }
  },

  updateRelationship: async (npcId, relId, data) => {
    try {
      const { relationship } = await lifeApi.updateRelationship(npcId, relId, data);
      set((s) => ({ relationships: s.relationships.map((r) => (r.id === relId ? relationship : r)) }));
      return relationship;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to update relationship' });
      return null;
    }
  },

  deleteRelationship: async (npcId, relId) => {
    try {
      await lifeApi.deleteRelationship(npcId, relId);
      set((s) => ({ relationships: s.relationships.filter((r) => r.id !== relId) }));
      return true;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to delete relationship' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  clearAll: () => set({ routines: [], goals: [], relationships: [] }),
}));
