// Memory types
export type MemoryType = 'identity' | 'fact' | 'preference' | 'event' | 'context';
export type MemoryStatus = 'active' | 'outdated' | 'archived';
export type DecisionAction = 'ADD' | 'UPDATE' | 'DELETE' | 'CONFLICT' | 'NONE';

export interface Memory {
  id: string;
  text: string;
  type: MemoryType;
  confidence: number;
  category?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  access_count: number;
  status: MemoryStatus;
  entities: string[];
  source_text?: string;
}

export interface ExtractedFact {
  text: string;
  type: MemoryType;
  confidence: number;
  category?: string;
  entities?: string[];
  source?: string;
}

export interface Decision {
  action: DecisionAction;
  reason: string;
  memory_id?: string;
  new_text?: string;
  new_confidence?: number;
}

export interface RetrievedMemory extends Memory {
  similarity?: number;
  hybrid_score?: number;
  rerank_score?: number;
}

// Chat types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Debug info for each message exchange
export interface DebugInfo {
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  cost: number;
  extracted_facts: ExtractedFact[];
  decisions: Decision[];
  retrieved_memories: RetrievedMemory[];
}

export interface ChatExchange {
  user_message: Message;
  assistant_message: Message;
  debug: DebugInfo;
}

// Session stats
export interface SessionStats {
  total_tokens: number;
  total_cost: number;
  memories_created: number;
  memories_updated: number;
  message_count: number;
}

// API configuration
export interface ApiConfig {
  openai_key?: string;
  supabase_url?: string;
  supabase_key?: string;
  cohere_key?: string;
}

// User profile
export interface User {
  id: string;
  email: string;
  created_at: string;
}
