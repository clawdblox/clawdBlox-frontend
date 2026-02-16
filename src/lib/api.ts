import { config } from './config';

const API_KEY_STORAGE_KEY = 'mw_api_key';

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data?.error;
    throw new ApiError(
      res.status,
      err?.code || 'UNKNOWN',
      err?.message || `Request failed with status ${res.status}`,
      err?.details,
    );
  }

  return data as T;
}

/**
 * Fetch wrapper for JWT-protected admin routes.
 * Sends cookies automatically via credentials: 'include'.
 */
export async function adminFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${config.apiUrl}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...rest,
  });

  // Auto-refresh on 401
  if (res.status === 401 && path !== '/api/auth/login' && path !== '/api/auth/refresh') {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const retryRes = await fetch(`${config.apiUrl}${path}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...(body !== undefined && { body: JSON.stringify(body) }),
        ...rest,
      });
      return handleResponse<T>(retryRes);
    }
  }

  return handleResponse<T>(res);
}

/**
 * Fetch wrapper for API key-protected v1 routes.
 * Sends the stored API key in x-api-key header.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new ApiError(401, 'NO_API_KEY', 'API key not configured. Go to Settings > API Keys to set it up.');
  }

  const { body, headers, ...rest } = options;

  const res = await fetch(`${config.apiUrl}/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...rest,
  });

  return handleResponse<T>(res);
}

async function refreshTokens(): Promise<boolean> {
  try {
    const res = await fetch(`${config.apiUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Auth API ────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    adminFetch<{ user: UserPublicResponse; api_key?: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  setup: (data: { email: string; password: string; display_name: string; project_name: string }) =>
    adminFetch<{ user: UserPublicResponse; api_key: string }>('/admin/setup', {
      method: 'POST',
      body: data,
    }),

  logout: () =>
    adminFetch<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  me: () =>
    adminFetch<{ user: UserPublicResponse }>('/api/auth/me'),

  refresh: () => refreshTokens(),
};

// ─── Project API ─────────────────────────────────────────────

export const projectApi = {
  get: () =>
    adminFetch<{ project: ProjectResponse }>('/admin/project'),

  update: (data: UpdateProjectInput) =>
    adminFetch<{ project: ProjectResponse }>('/admin/project', {
      method: 'PUT',
      body: data,
    }),

  rotateApiKey: () =>
    adminFetch<{ api_key: string; message: string }>('/admin/project/rotate-api-key', {
      method: 'POST',
    }),

  rotateSigningSecret: () =>
    adminFetch<{ signing_secret: string; message: string }>('/admin/project/rotate-signing-secret', {
      method: 'POST',
    }),
};

// ─── Users / Team API ────────────────────────────────────────

export const usersApi = {
  list: () =>
    adminFetch<{ users: UserPublicResponse[] }>('/admin/users'),

  create: (data: CreateUserInput) =>
    adminFetch<{ user: UserPublicResponse }>('/admin/users', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: UpdateUserInput) =>
    adminFetch<{ user: UserPublicResponse }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    adminFetch<void>(`/admin/users/${id}`, { method: 'DELETE' }),
};

// ─── NPC API ─────────────────────────────────────────────────

export const npcApi = {
  list: (page = 1, limit = 20) =>
    apiFetch<{ npcs: NpcResponse[]; pagination: PaginationResponse }>(`/npcs?page=${page}&limit=${limit}`),

  get: (id: string) =>
    apiFetch<{ npc: NpcResponse }>(`/npcs/${id}`),

  create: (data: CreateNpcInput) =>
    apiFetch<{ npc: NpcResponse }>('/npcs', { method: 'POST', body: data }),

  generate: (data: GenerateNpcInput) =>
    apiFetch<{ npc: NpcResponse }>('/npcs/generate', { method: 'POST', body: data }),

  update: (id: string, data: UpdateNpcInput) =>
    apiFetch<{ npc: NpcResponse }>(`/npcs/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<void>(`/npcs/${id}`, { method: 'DELETE' }),
};

// ─── Memory API ──────────────────────────────────────────────

export const memoryApi = {
  list: (npcId: string, page = 1, limit = 20) =>
    apiFetch<{ memories: MemoryResponse[]; pagination: PaginationResponse }>(
      `/npcs/${npcId}/memories?page=${page}&limit=${limit}`,
    ),

  get: (npcId: string, memoryId: string) =>
    apiFetch<{ memory: MemoryResponse }>(`/npcs/${npcId}/memories/${memoryId}`),

  create: (npcId: string, data: CreateMemoryInput) =>
    apiFetch<{ memory: MemoryResponse }>(`/npcs/${npcId}/memories`, {
      method: 'POST',
      body: data,
    }),

  update: (npcId: string, memoryId: string, data: UpdateMemoryInput) =>
    apiFetch<{ memory: MemoryResponse }>(`/npcs/${npcId}/memories/${memoryId}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (npcId: string, memoryId: string) =>
    apiFetch<void>(`/npcs/${npcId}/memories/${memoryId}`, { method: 'DELETE' }),

  search: (npcId: string, data: SearchMemoryInput) =>
    apiFetch<{ memories: MemorySearchResultResponse[] }>(`/npcs/${npcId}/memories/search`, {
      method: 'POST',
      body: data,
    }),
};

// ─── Conversation API ────────────────────────────────────────

export const conversationApi = {
  listByNpc: (npcId: string, page = 1, limit = 20) =>
    apiFetch<{ conversations: ConversationResponse[]; pagination: PaginationResponse }>(
      `/npcs/${npcId}/conversations?page=${page}&limit=${limit}`,
    ),

  getMessages: (conversationId: string, limit = 50) =>
    apiFetch<{ messages: MessageResponse[] }>(
      `/conversations/${conversationId}/messages?limit=${limit}`,
    ),

  chat: (npcId: string, data: { platform: string; platform_user_id: string; message: string }) =>
    apiFetch<ChatResponseData>(`/npcs/${npcId}/chat/bot`, {
      method: 'POST',
      body: data,
    }),
};

// ─── Life API (Routines, Goals, Relationships) ───────────────

export const lifeApi = {
  // Routines
  listRoutines: (npcId: string) =>
    apiFetch<{ routines: RoutineResponse[] }>(`/npcs/${npcId}/routines`),

  createRoutine: (npcId: string, data: CreateRoutineInput) =>
    apiFetch<{ routine: RoutineResponse }>(`/npcs/${npcId}/routines`, {
      method: 'POST',
      body: data,
    }),

  updateRoutine: (npcId: string, routineId: string, data: UpdateRoutineInput) =>
    apiFetch<{ routine: RoutineResponse }>(`/npcs/${npcId}/routines/${routineId}`, {
      method: 'PUT',
      body: data,
    }),

  deleteRoutine: (npcId: string, routineId: string) =>
    apiFetch<void>(`/npcs/${npcId}/routines/${routineId}`, { method: 'DELETE' }),

  // Goals
  listGoals: (npcId: string) =>
    apiFetch<{ goals: GoalResponse[] }>(`/npcs/${npcId}/goals`),

  createGoal: (npcId: string, data: CreateGoalInput) =>
    apiFetch<{ goal: GoalResponse }>(`/npcs/${npcId}/goals`, {
      method: 'POST',
      body: data,
    }),

  updateGoal: (npcId: string, goalId: string, data: UpdateGoalInput) =>
    apiFetch<{ goal: GoalResponse }>(`/npcs/${npcId}/goals/${goalId}`, {
      method: 'PUT',
      body: data,
    }),

  deleteGoal: (npcId: string, goalId: string) =>
    apiFetch<void>(`/npcs/${npcId}/goals/${goalId}`, { method: 'DELETE' }),

  // Relationships
  listRelationships: (npcId: string) =>
    apiFetch<{ relationships: RelationshipResponse[] }>(`/npcs/${npcId}/relationships`),

  createRelationship: (npcId: string, data: CreateRelationshipInput) =>
    apiFetch<{ relationship: RelationshipResponse }>(`/npcs/${npcId}/relationships`, {
      method: 'POST',
      body: data,
    }),

  updateRelationship: (npcId: string, relationshipId: string, data: UpdateRelationshipInput) =>
    apiFetch<{ relationship: RelationshipResponse }>(`/npcs/${npcId}/relationships/${relationshipId}`, {
      method: 'PUT',
      body: data,
    }),

  deleteRelationship: (npcId: string, relationshipId: string) =>
    apiFetch<void>(`/npcs/${npcId}/relationships/${relationshipId}`, { method: 'DELETE' }),
};

// ─── Channel Bindings API ────────────────────────────────────

export const channelApi = {
  list: () =>
    apiFetch<{ bindings: ChannelBindingResponse[] }>('/channels/bindings'),

  bind: (data: CreateChannelBindingInput) =>
    apiFetch<{ binding: ChannelBindingResponse }>('/channels/bind', {
      method: 'POST',
      body: data,
    }),

  unbind: (data: { npc_id: string; platform: string; platform_channel_id: string }) =>
    apiFetch<void>('/channels/bind', {
      method: 'DELETE',
      body: data,
    }),
};

// ─── Stats API ───────────────────────────────────────────────

export const statsApi = {
  get: () =>
    apiFetch<StatsResponse>('/stats'),
};

// ─── Response Types ──────────────────────────────────────────

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UserPublicResponse {
  id: string;
  email: string;
  display_name: string;
  role: 'owner' | 'editor' | 'viewer';
  project_id: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  api_key_prefix: string;
  api_key?: string;
  player_signing_secret: string;
  settings: {
    groq_chat_model?: string;
    groq_embed_model?: string;
    max_npcs?: number;
    max_memories_per_npc?: number;
    memory_decay_enabled?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface NpcResponse {
  id: string;
  project_id: string;
  name: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    traits?: string[];
    values?: string[];
    fears?: string[];
    desires?: string[];
  };
  speaking_style: {
    vocabulary_level: string;
    formality: string;
    humor: string;
    verbosity: string;
    quirks: string[];
    catchphrases: string[];
    speech_patterns?: string[];
    accent?: string;
  };
  backstory: string;
  system_prompt: string;
  mood: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemoryResponse {
  id: string;
  npc_id: string;
  type: 'episodic' | 'semantic' | 'emotional' | 'procedural';
  importance: 'trivial' | 'minor' | 'moderate' | 'significant' | 'critical';
  vividness: number;
  content: string;
  metadata: Record<string, unknown>;
  access_count: number;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemorySearchResultResponse extends MemoryResponse {
  similarity: number;
}

export interface ConversationResponse {
  id: string;
  npc_id: string;
  player_id: string;
  status: 'active' | 'ended' | 'archived';
  summary?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  role: 'player' | 'npc' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatResponseData {
  conversation_id: string;
  message: string;
  npc_mood?: string;
}

export interface RoutineResponse {
  id: string;
  npc_id: string;
  name: string;
  start_hour: number;
  end_hour: number;
  day_of_week: number[];
  location: string;
  activity: string;
  interruptible: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface GoalResponse {
  id: string;
  npc_id: string;
  title: string;
  goal_type: 'personal' | 'professional' | 'social' | 'survival' | 'secret';
  priority: number;
  progress: number;
  status: 'active' | 'completed' | 'failed' | 'abandoned' | 'paused';
  success_criteria: string[];
  parent_goal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RelationshipResponse {
  id: string;
  npc_id: string;
  target_type: 'player' | 'npc';
  target_id: string;
  affinity: number;
  trust: number;
  familiarity: number;
  interaction_history: Array<{ timestamp: string; type: string; summary: string }>;
  created_at: string;
  updated_at: string;
}

export interface StatsResponse {
  npcs: { total: number };
  conversations: { total: number; active: number };
  memories: { total: number; avg_vividness: number };
  relationships: {
    total: number;
    avg_affinity: number;
    avg_trust: number;
    avg_familiarity: number;
  };
}

// ─── Input Types ─────────────────────────────────────────────

export interface CreateNpcInput {
  name: string;
  personality: NpcResponse['personality'];
  speaking_style: {
    vocabulary_level: 'simple' | 'moderate' | 'advanced' | 'archaic';
    formality: 'casual' | 'neutral' | 'formal';
    humor: 'none' | 'subtle' | 'frequent' | 'sarcastic';
    verbosity: 'terse' | 'concise' | 'normal' | 'verbose';
    quirks?: string[];
    catchphrases?: string[];
    speech_patterns?: string[];
    accent?: string;
  };
  backstory: string;
  system_prompt?: string;
  mood?: string;
}

export interface UpdateNpcInput {
  name?: string;
  personality?: Partial<NpcResponse['personality']>;
  speaking_style?: Partial<CreateNpcInput['speaking_style']>;
  backstory?: string;
  system_prompt?: string;
  mood?: string;
  is_active?: boolean;
}

export interface GenerateNpcInput {
  description: string;
  traits?: Partial<Record<string, number>>;
  setting?: string;
}

export interface UpdateProjectInput {
  name?: string;
  groq_api_key?: string;
  settings?: {
    groq_chat_model?: string;
    groq_embed_model?: string;
    max_npcs?: number;
    max_memories_per_npc?: number;
    memory_decay_enabled?: boolean;
  };
}

export interface CreateUserInput {
  email: string;
  password: string;
  display_name: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  display_name?: string;
  role?: 'owner' | 'editor' | 'viewer';
  is_active?: boolean;
}

export interface CreateMemoryInput {
  type: 'episodic' | 'semantic' | 'emotional' | 'procedural';
  importance: 'trivial' | 'minor' | 'moderate' | 'significant' | 'critical';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMemoryInput {
  importance?: 'trivial' | 'minor' | 'moderate' | 'significant' | 'critical';
  vividness?: number;
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchMemoryInput {
  query: string;
  limit?: number;
  min_vividness?: number;
  types?: Array<'episodic' | 'semantic' | 'emotional' | 'procedural'>;
  importance_levels?: Array<'trivial' | 'minor' | 'moderate' | 'significant' | 'critical'>;
}

export interface CreateRoutineInput {
  name: string;
  start_hour: number;
  end_hour: number;
  day_of_week: number[];
  location: string;
  activity: string;
  interruptible?: boolean;
  priority?: number;
}

export interface UpdateRoutineInput extends Partial<CreateRoutineInput> {}

export interface CreateGoalInput {
  title: string;
  goal_type: 'personal' | 'professional' | 'social' | 'survival' | 'secret';
  priority?: number;
  success_criteria: string[];
  parent_goal_id?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {}

export interface CreateRelationshipInput {
  target_type: 'player' | 'npc';
  target_id: string;
  affinity?: number;
  trust?: number;
  familiarity?: number;
}

export interface UpdateRelationshipInput {
  affinity?: number;
  trust?: number;
  familiarity?: number;
}

// ─── Channel Bindings Types ─────────────────────────────────

export interface ChannelBindingResponse {
  id: string;
  project_id: string;
  npc_id: string;
  platform: 'discord' | 'telegram';
  platform_channel_id: string;
  created_at: string;
}

export interface CreateChannelBindingInput {
  npc_id: string;
  platform: 'discord' | 'telegram';
  platform_channel_id: string;
}
