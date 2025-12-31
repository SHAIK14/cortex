-- Cortex Memory Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the required tables and functions

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('identity', 'fact', 'preference', 'event', 'context')),
    confidence FLOAT NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
    category TEXT,
    embedding VECTOR(1536),
    entities TEXT[] DEFAULT '{}',
    source_text TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'outdated', 'archived')),
    access_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    replaced_by UUID REFERENCES memories(id),
    conversation_id TEXT
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_status ON memories(status);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_user_status ON memories(user_id, status);

-- Create vector similarity search index (IVFFlat for performance)
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_memories(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    p_user_id TEXT
)
RETURNS TABLE (
    id UUID,
    user_id TEXT,
    text TEXT,
    type TEXT,
    confidence FLOAT,
    category TEXT,
    entities TEXT[],
    source_text TEXT,
    status TEXT,
    access_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.user_id,
        m.text,
        m.type,
        m.confidence,
        m.category,
        m.entities,
        m.source_text,
        m.status,
        m.access_count,
        m.created_at,
        m.updated_at,
        m.last_accessed_at,
        1 - (m.embedding <=> query_embedding) AS similarity
    FROM memories m
    WHERE m.user_id = p_user_id
        AND m.status = 'active'
        AND 1 - (m.embedding <=> query_embedding) > match_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function for full-text search (BM25-style keyword search)
CREATE OR REPLACE FUNCTION keyword_search_memories(
    query_text TEXT,
    p_user_id TEXT,
    match_count INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    user_id TEXT,
    text TEXT,
    type TEXT,
    confidence FLOAT,
    category TEXT,
    entities TEXT[],
    status TEXT,
    access_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.user_id,
        m.text,
        m.type,
        m.confidence,
        m.category,
        m.entities,
        m.status,
        m.access_count,
        m.created_at,
        m.updated_at,
        ts_rank(to_tsvector('english', m.text), plainto_tsquery('english', query_text)) AS rank
    FROM memories m
    WHERE m.user_id = p_user_id
        AND m.status = 'active'
        AND to_tsvector('english', m.text) @@ plainto_tsquery('english', query_text)
    ORDER BY rank DESC
    LIMIT match_count;
END;
$$;

-- Create text search index for keyword search
CREATE INDEX IF NOT EXISTS idx_memories_text_search ON memories
USING gin(to_tsvector('english', text));

-- Row Level Security (RLS) - Optional but recommended
-- Uncomment if you want to enable RLS for additional security

-- ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can only access their own memories"
-- ON memories FOR ALL
-- USING (user_id = current_setting('app.current_user_id', true));

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
