import { create } from 'zustand';

const STORAGE_KEY = 'mw_tutorial_completed';
const TOTAL_STEPS = 11;

function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSetItem(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}

function safeRemoveItem(key: string): void {
  try { localStorage.removeItem(key); } catch {}
}

interface TutorialState {
  isActive: boolean;
  currentStep: number;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  complete: () => void;
  reset: () => void;
  hasCompleted: () => boolean;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isActive: false,
  currentStep: 0,

  start: () => set({ isActive: true, currentStep: 0 }),

  next: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
  })),

  prev: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  skip: () => {
    safeSetItem(STORAGE_KEY, 'true');
    set({ isActive: false, currentStep: 0 });
  },

  complete: () => {
    safeSetItem(STORAGE_KEY, 'true');
    set({ isActive: false, currentStep: 0 });
  },

  reset: () => {
    safeRemoveItem(STORAGE_KEY);
    set({ isActive: true, currentStep: 0 });
  },

  hasCompleted: () => safeGetItem(STORAGE_KEY) === 'true',
}));
