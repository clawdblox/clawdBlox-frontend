import { create } from 'zustand';
import { conversationApi, ApiError } from '../lib/api';
import { useAuthStore } from './auth.store';
import type { ConversationResponse, MessageResponse, PaginationResponse, ChatResponseData } from '../lib/api';

interface ConversationState {
  conversations: ConversationResponse[];
  messages: MessageResponse[];
  pagination: PaginationResponse | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  fetchConversations: (npcId: string, page?: number, limit?: number) => Promise<void>;
  fetchMessages: (conversationId: string, limit?: number) => Promise<void>;
  sendMessage: (npcId: string, message: string) => Promise<ChatResponseData | null>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  messages: [],
  pagination: null,
  isLoading: false,
  isSending: false,
  error: null,

  fetchConversations: async (npcId, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const data = await conversationApi.listByNpc(npcId, page, limit);
      set({ conversations: data.conversations, pagination: data.pagination, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load conversations' });
    }
  },

  fetchMessages: async (conversationId, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const { messages } = await conversationApi.getMessages(conversationId, limit);
      set({ messages, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof ApiError ? err.message : 'Failed to load messages' });
    }
  },

  sendMessage: async (npcId, message) => {
    set({ isSending: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      const response = await conversationApi.chat(npcId, {
        platform: 'web',
        platform_user_id: user?.id ?? 'anonymous',
        message,
      });
      set({ isSending: false });
      return response;
    } catch (err) {
      set({ isSending: false, error: err instanceof ApiError ? err.message : "Failed to send message" });
      return null;
    }
  },

  clearMessages: () => set({ messages: [] }),
  clearError: () => set({ error: null }),
}));
