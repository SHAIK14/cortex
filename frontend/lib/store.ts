import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Message,
  ChatExchange,
  SessionStats,
  ApiConfig,
  User,
  Memory
} from '@/types';

interface ChatState {
  messages: Message[];
  exchanges: ChatExchange[];
  sessionStats: SessionStats;
  isStreaming: boolean;

  addMessage: (message: Message) => void;
  addExchange: (exchange: ChatExchange) => void;
  updateStats: (stats: Partial<SessionStats>) => void;
  setStreaming: (streaming: boolean) => void;
  clearChat: () => void;
}

interface ConfigState {
  apiConfig: ApiConfig;
  setApiConfig: (config: Partial<ApiConfig>) => void;
  clearApiConfig: () => void;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

interface MemoryState {
  memories: Memory[];
  selectedMemory: Memory | null;
  isLoading: boolean;

  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => void;
  removeMemory: (id: string) => void;
  selectMemory: (memory: Memory | null) => void;
  setLoading: (loading: boolean) => void;
}

interface UIState {
  sidebarOpen: boolean;
  debugPanelOpen: boolean;
  theme: 'dark' | 'light' | 'system';

  toggleSidebar: () => void;
  toggleDebugPanel: () => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

// Chat store
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  exchanges: [],
  sessionStats: {
    total_tokens: 0,
    total_cost: 0,
    memories_created: 0,
    memories_updated: 0,
    message_count: 0,
  },
  isStreaming: false,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  addExchange: (exchange) =>
    set((state) => ({ exchanges: [...state.exchanges, exchange] })),

  updateStats: (stats) =>
    set((state) => ({
      sessionStats: { ...state.sessionStats, ...stats }
    })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  clearChat: () => set({
    messages: [],
    exchanges: [],
    sessionStats: {
      total_tokens: 0,
      total_cost: 0,
      memories_created: 0,
      memories_updated: 0,
      message_count: 0,
    }
  }),
}));

// Config store (persisted)
export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      apiConfig: {},

      setApiConfig: (config) =>
        set((state) => ({
          apiConfig: { ...state.apiConfig, ...config }
        })),

      clearApiConfig: () => set({ apiConfig: {} }),
    }),
    {
      name: 'cortex-config',
    }
  )
);

// Auth store (persisted)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'cortex-auth',
    }
  )
);

// Memory store
export const useMemoryStore = create<MemoryState>((set) => ({
  memories: [],
  selectedMemory: null,
  isLoading: false,

  setMemories: (memories) => set({ memories }),
  addMemory: (memory) =>
    set((state) => ({ memories: [memory, ...state.memories] })),
  removeMemory: (id) =>
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id)
    })),
  selectMemory: (memory) => set({ selectedMemory: memory }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// UI store (persisted)
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      debugPanelOpen: true,
      theme: 'dark',

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleDebugPanel: () =>
        set((state) => ({ debugPanelOpen: !state.debugPanelOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'cortex-ui',
    }
  )
);
