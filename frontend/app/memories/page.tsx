'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, Header } from '@/components/layout';
import { MemoryCard, MemoryFilter } from '@/components/memories';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore, useMemoryStore, useConfigStore } from '@/lib/store';
import { NeuralBackground } from '@/components/memories/NeuralBackground';
import { Database } from 'lucide-react';
import { api } from '@/lib/api';
import type { Memory, MemoryType } from '@/types';

export default function MemoriesPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const { apiConfig } = useConfigStore();
  const { memories, setMemories, removeMemory, isLoading, setLoading } = useMemoryStore();
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<MemoryType[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'access'>('date');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Set access token for API calls
    if (accessToken) {
      api.setAccessToken(accessToken);
    }

    // Check if user has valid credentials
    if (!api.hasValidCredentials(apiConfig)) {
      setError('Please configure your API keys in Settings to view memories.');
      setLoading(false);
      return;
    }

    // Load memories from API
    const loadMemories = async () => {
      setLoading(true);
      setError(null);
      try {
        const credentials = api.buildCredentials(apiConfig);
        const response = await api.listMemories(credentials);
        setMemories(response.memories);
      } catch (err) {
        console.error('Failed to load memories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load memories');
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, [isAuthenticated, accessToken, apiConfig, router, setMemories, setLoading]);

  const filteredMemories = useMemo(() => {
    let result = [...memories];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.text.toLowerCase().includes(searchLower) ||
          m.category?.toLowerCase().includes(searchLower) ||
          m.entities.some((e) => e.toLowerCase().includes(searchLower))
      );
    }

    // Filter by types
    if (selectedTypes.length > 0) {
      result = result.filter((m) => selectedTypes.includes(m.type));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'confidence':
          return b.confidence - a.confidence;
        case 'access':
          return b.access_count - a.access_count;
        default:
          return 0;
      }
    });

    return result;
  }, [memories, search, selectedTypes, sortBy]);

  const handleDelete = async (id: string) => {
    if (!api.hasValidCredentials(apiConfig)) return;

    try {
      const credentials = api.buildCredentials(apiConfig);
      await api.deleteMemory(credentials, id);
      removeMemory(id);
    } catch (err) {
      console.error('Failed to delete memory:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete memory');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <Header title="Neural Vault" />

      <main className="flex-1 bg-[var(--obsidian-bg)] relative overflow-hidden flex flex-col min-h-0">
        <NeuralBackground />
        
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8 relative z-10 max-w-7xl mx-auto">
            {/* Vault Status Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--obsidian-border)] pb-8 pt-4">
              <div className="space-y-2">
                  <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <h2 className="text-3xl font-bold tracking-tighter text-foreground uppercase">Neural_Archives_v2</h2>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--obsidian-stat-label)] max-w-md leading-relaxed">
                      Surgical retrieval system for extracted factual weights and identity mappings. 
                      Integrity: <span className="text-green-500">OPTIMAL</span>
                  </p>
              </div>

              <div className="flex items-center gap-8">
                  <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Records</p>
                      <p className="text-xl font-mono font-bold text-foreground">{memories.length}</p>
                  </div>
                  <div className="text-right border-l border-[var(--obsidian-border)] pl-8">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Avg Confidence</p>
                      <p className="text-xl font-mono font-bold text-primary">
                          {(memories.reduce((acc, m) => acc + m.confidence, 0) / (memories.length || 1) * 100).toFixed(1)}%
                      </p>
                  </div>
                  <div className="text-right border-l border-[var(--obsidian-border)] pl-8">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Recall Rate</p>
                      <p className="text-xl font-mono font-bold text-foreground">
                          {memories.reduce((acc, m) => acc + m.access_count, 0)}
                      </p>
                  </div>
              </div>
            </div>

            {/* Filters Area */}
            <div className="sticky top-0 z-20 bg-[var(--obsidian-bg)]/80 backdrop-blur-md py-4 border-b border-[var(--obsidian-border)] -mx-6 px-6">
              <div className="max-w-7xl mx-auto">
                  <MemoryFilter
                      search={search}
                      onSearchChange={setSearch}
                      selectedTypes={selectedTypes}
                      onTypesChange={setSelectedTypes}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                  />
              </div>
            </div>

            {/* Memory Grid */}
            <div className="relative">
              {error ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-red-500/20 rounded-sm bg-red-500/5">
                  <div className="rounded-full bg-red-500/10 p-6 mb-6">
                    <Database className="h-10 w-10 text-red-500/50" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-red-500">
                    Connection_Error
                  </h3>
                  <p className="mt-3 max-w-md text-[10px] font-bold uppercase tracking-widest text-red-500/60 leading-relaxed">
                    {error}
                  </p>
                </div>
              ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-40 w-full bg-[var(--obsidian-card)] rounded-none" />
                  ))}
                </div>
              ) : filteredMemories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[var(--obsidian-border)] rounded-sm">
                  <div className="rounded-full bg-primary/5 p-6 mb-6">
                    <Database className="h-10 w-10 text-primary/30" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                    Vault_Empty_Result
                  </h3>
                  <p className="mt-3 max-w-xs text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-relaxed">
                    {search || selectedTypes.length > 0
                      ? 'No records matching the provided filter signature.'
                      : 'System standby. Awaiting first neural extraction trace.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--obsidian-stat-label)]">
                          Query results: {filteredMemories.length} matches
                      </span>
                      <div className="h-px flex-1 bg-[var(--obsidian-border)] mx-4 opacity-50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMemories.map((memory) => (
                      <MemoryCard
                          key={memory.id}
                          memory={memory}
                          onDelete={handleDelete}
                      />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </main>
    </DashboardLayout>
  );
}
