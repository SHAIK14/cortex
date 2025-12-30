import type {
  Memory,
  ExtractedFact,
  Decision,
  RetrievedMemory,
  DebugInfo
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiOptions {
  apiKey?: string;
  userId?: string;
}

class CortexAPI {
  private apiKey: string = '';
  private userId: string = 'playground_user';

  setCredentials(apiKey: string, userId: string = 'playground_user') {
    this.apiKey = apiKey;
    this.userId = userId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Memory operations
  async addMemory(conversation: { role: string; content: string }[]): Promise<{
    extracted_facts: ExtractedFact[];
    decisions: Decision[];
    debug: DebugInfo;
  }> {
    return this.request('/memory/add', {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId,
        conversation,
      }),
    });
  }

  async searchMemories(query: string, limit: number = 10): Promise<RetrievedMemory[]> {
    return this.request('/memory/search', {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId,
        query,
        limit,
      }),
    });
  }

  async listMemories(): Promise<Memory[]> {
    return this.request(`/users/${this.userId}/memories`);
  }

  async getMemory(id: string): Promise<Memory> {
    return this.request(`/memory/${id}`);
  }

  async deleteMemory(id: string): Promise<void> {
    return this.request(`/memory/${id}`, {
      method: 'DELETE',
    });
  }

  // Chat with memory (combined endpoint)
  async chat(
    messages: { role: string; content: string }[],
    systemPrompt?: string
  ): Promise<{
    response: string;
    debug: DebugInfo;
  }> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId,
        messages,
        system_prompt: systemPrompt,
      }),
    });
  }

  // Stats
  async getStats(): Promise<{
    total_memories: number;
    total_chats: number;
    total_cost: number;
  }> {
    return this.request('/stats');
  }

  // Health check
  async health(): Promise<{ status: string }> {
    return this.request('/health');
  }
}

export const api = new CortexAPI();
export default api;
