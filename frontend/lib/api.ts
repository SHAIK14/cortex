import type {
  Memory,
  Credentials,
  AddMemoryResponse,
  SearchMemoryResponse,
  ListMemoriesResponse,
  StatsResponse,
  AuthResponse,
  RetrievedMemory,
  ChatResponse,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Cortex API Client
 *
 * All memory endpoints require:
 * - JWT token in Authorization header (from login)
 * - Credentials object in request body (user's API keys)
 */
class CortexAPI {
  private accessToken: string = '';

  /**
   * Set the JWT access token for authentication
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    this.accessToken = '';
  }

  /**
   * Check if user has valid credentials configured
   */
  hasValidCredentials(config: Partial<Credentials>): boolean {
    return !!(config.openai_key && config.supabase_url && config.supabase_key);
  }

  /**
   * Build credentials object from config
   */
  buildCredentials(config: Partial<Credentials>): Credentials {
    if (!config.openai_key || !config.supabase_url || !config.supabase_key) {
      throw new Error('Missing required credentials. Please configure API keys in Settings.');
    }
    return {
      openai_key: config.openai_key,
      supabase_url: config.supabase_url,
      supabase_key: config.supabase_key,
      cohere_key: config.cohere_key,
    };
  }

  /**
   * Make authenticated request to API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // ============================================
  // AUTH ENDPOINTS (no credentials needed)
  // ============================================

  async signup(email: string, password: string): Promise<AuthResponse> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // ============================================
  // MEMORY ENDPOINTS (requires credentials)
  // ============================================

  /**
   * Add memories from a conversation
   */
  async addMemory(
    credentials: Credentials,
    messages: { role: string; content: string }[],
    conversationId?: string
  ): Promise<AddMemoryResponse> {
    return this.request('/memory/add', {
      method: 'POST',
      body: JSON.stringify({
        credentials,
        messages,
        conversation_id: conversationId,
      }),
    });
  }

  /**
   * Search memories
   */
  async searchMemories(
    credentials: Credentials,
    query: string,
    limit: number = 10
  ): Promise<SearchMemoryResponse> {
    return this.request('/memory/search', {
      method: 'POST',
      body: JSON.stringify({
        credentials,
        query,
        limit,
      }),
    });
  }

  /**
   * List all memories for the authenticated user
   */
  async listMemories(credentials: Credentials): Promise<ListMemoriesResponse> {
    return this.request('/memory/list', {
      method: 'POST',
      body: JSON.stringify({ credentials }),
    });
  }

  /**
   * Get a single memory by ID
   */
  async getMemory(credentials: Credentials, memoryId: string): Promise<{ memory: Memory }> {
    return this.request(`/memory/${memoryId}`, {
      method: 'POST',
      body: JSON.stringify({ credentials }),
    });
  }

  /**
   * Delete a memory
   */
  async deleteMemory(credentials: Credentials, memoryId: string): Promise<{ message: string; id: string }> {
    return this.request(`/memory/${memoryId}/delete`, {
      method: 'POST',
      body: JSON.stringify({ credentials }),
    });
  }

  /**
   * Get memory statistics
   */
  async getStats(credentials: Credentials): Promise<StatsResponse> {
    return this.request('/memory/stats', {
      method: 'POST',
      body: JSON.stringify({ credentials }),
    });
  }

  /**
   * Chat with memory-augmented context
   * Retrieves relevant memories, generates response, and extracts new facts
   */
  async chat(
    credentials: Credentials,
    message: string,
    options?: {
      conversationId?: string;
      retrieveK?: number;
      extractMemories?: boolean;
    }
  ): Promise<ChatResponse> {
    return this.request('/memory/chat', {
      method: 'POST',
      body: JSON.stringify({
        credentials,
        message,
        conversation_id: options?.conversationId,
        retrieve_k: options?.retrieveK ?? 5,
        extract_memories: options?.extractMemories ?? true,
      }),
    });
  }

  // ============================================
  // UTILITY ENDPOINTS
  // ============================================

  /**
   * Health check (no auth needed)
   */
  async health(): Promise<{ status: string }> {
    return this.request('/health');
  }
}

export const api = new CortexAPI();
export default api;
