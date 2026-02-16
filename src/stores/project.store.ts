import { create } from 'zustand';
import { projectApi, ApiError, setStoredApiKey } from '../lib/api';
import type { ProjectResponse, UpdateProjectInput } from '../lib/api';

interface ProjectState {
  project: ProjectResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchProject: () => Promise<void>;
  updateProject: (data: UpdateProjectInput) => Promise<boolean>;
  rotateApiKey: () => Promise<string | null>;
  rotateSigningSecret: () => Promise<string | null>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  isLoading: false,
  error: null,

  fetchProject: async () => {
    set({ isLoading: true, error: null });
    try {
      const { project } = await projectApi.get();
      if (project.api_key) setStoredApiKey(project.api_key);
      set({ project, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load project' });
    }
  },

  updateProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { project } = await projectApi.update(data);
      set({ project, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to update project' });
      return false;
    }
  },

  rotateApiKey: async () => {
    set({ error: null });
    try {
      const { api_key } = await projectApi.rotateApiKey();
      setStoredApiKey(api_key);
      return api_key;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to rotate API key' });
      return null;
    }
  },

  rotateSigningSecret: async () => {
    set({ error: null });
    try {
      const { signing_secret } = await projectApi.rotateSigningSecret();
      set((s) => ({
        project: s.project ? { ...s.project, player_signing_secret: signing_secret } : null,
      }));
      return signing_secret;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Failed to rotate signing secret' });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
