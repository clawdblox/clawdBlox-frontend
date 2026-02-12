import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'player' | 'npc';
  content: string;
  timestamp: string;
}

export type TabId = 'home' | 'npcs' | 'chat' | 'more';
export type ScreenId =
  | 'overview'
  | 'npc-list'
  | 'npc-detail'
  | 'npc-create'
  | 'chat-select'
  | 'chat-live'
  | 'more-menu'
  | 'memories'
  | 'conversations'
  | 'analytics'
  | 'settings'
  | 'api-keys'
  | 'team'
  | 'login'
  | 'setup';

interface NavigationState {
  screen: ScreenId;
  title: string;
  params?: Record<string, string>;
}

interface UIStore {
  activeTab: TabId;
  stacks: Record<TabId, NavigationState[]>;
  selectedNpcId: string | null;
  selectedNpcTab: number;
  chatMessages: ChatMessage[];
  chatNpcId: string | null;
  isStreaming: boolean;
  showTabBar: boolean;
  setTab: (tab: TabId) => void;
  pushScreen: (screen: ScreenId, title: string, params?: Record<string, string>) => void;
  popScreen: () => void;
  setSelectedNpcId: (id: string | null) => void;
  setSelectedNpcTab: (tab: number) => void;
  setChatNpcId: (id: string | null) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  setIsStreaming: (v: boolean) => void;
  setShowTabBar: (v: boolean) => void;
  getCurrentScreen: () => NavigationState;
}

const initialStacks: Record<TabId, NavigationState[]> = {
  home: [{ screen: 'overview', title: 'Overview' }],
  npcs: [{ screen: 'npc-list', title: 'NPCs' }],
  chat: [{ screen: 'chat-select', title: 'Chat' }],
  more: [{ screen: 'more-menu', title: 'Plus' }],
};

export const useUIStore = create<UIStore>((set, get) => ({
  activeTab: 'home',
  stacks: { ...initialStacks },
  selectedNpcId: null,
  selectedNpcTab: 0,
  chatMessages: [],
  chatNpcId: null,
  isStreaming: false,
  showTabBar: true,

  setTab: (tab) => set({ activeTab: tab }),

  pushScreen: (screen, title, params) =>
    set((state) => {
      const currentStack = [...state.stacks[state.activeTab]];
      currentStack.push({ screen, title, params });
      return {
        stacks: { ...state.stacks, [state.activeTab]: currentStack },
      };
    }),

  popScreen: () =>
    set((state) => {
      const currentStack = [...state.stacks[state.activeTab]];
      if (currentStack.length > 1) {
        currentStack.pop();
      }
      return {
        stacks: { ...state.stacks, [state.activeTab]: currentStack },
        showTabBar: true,
      };
    }),

  setSelectedNpcId: (id) => set({ selectedNpcId: id }),
  setSelectedNpcTab: (tab) => set({ selectedNpcTab: tab }),
  setChatNpcId: (id) => set({ chatNpcId: id }),

  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),

  clearChat: () => set({ chatMessages: [] }),
  setIsStreaming: (v) => set({ isStreaming: v }),
  setShowTabBar: (v) => set({ showTabBar: v }),

  getCurrentScreen: () => {
    const state = get();
    const stack = state.stacks[state.activeTab];
    return stack[stack.length - 1];
  },
}));
