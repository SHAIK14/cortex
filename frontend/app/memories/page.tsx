'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, Header } from '@/components/layout';
import { MemoryCard, MemoryFilter } from '@/components/memories';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore, useMemoryStore } from '@/lib/store';
import { Database } from 'lucide-react';
import type { Memory, MemoryType } from '@/types';

// Mock data for demonstration
const mockMemories: Memory[] = [
  {
    id: '1',
    text: 'User is a software engineer',
    type: 'identity',
    confidence: 0.95,
    category: 'employment',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    access_count: 12,
    status: 'active',
    entities: ['software engineer'],
  },
  {
    id: '2',
    text: 'Prefers dark mode in all applications',
    type: 'preference',
    confidence: 0.88,
    category: 'ui',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    access_count: 5,
    status: 'active',
    entities: ['dark mode'],
  },
  {
    id: '3',
    text: 'Lives in Berlin, Germany',
    type: 'fact',
    confidence: 0.92,
    category: 'location',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    access_count: 8,
    status: 'active',
    entities: ['Berlin', 'Germany'],
  },
  {
    id: '4',
    text: 'Is vegetarian',
    type: 'identity',
    confidence: 0.85,
    category: 'diet',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    access_count: 3,
    status: 'active',
    entities: ['vegetarian'],
  },
  {
    id: '5',
    text: 'Attended React conference last week',
    type: 'event',
    confidence: 0.78,
    category: 'events',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    access_count: 2,
    status: 'active',
    entities: ['React', 'conference'],
  },
];

export default function MemoriesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { memories, setMemories, removeMemory, isLoading, setLoading } = useMemoryStore();

  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<MemoryType[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'access'>('date');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load mock memories
    setLoading(true);
    setTimeout(() => {
      setMemories(mockMemories);
      setLoading(false);
    }, 500);
  }, [isAuthenticated, router, setMemories, setLoading]);

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

  const handleDelete = (id: string) => {
    // TODO: Call API to delete memory
    removeMemory(id);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <Header title="Neural Vault" />

      <main className="min-h-screen bg-[var(--obsidian-bg)] relative overflow-hidden">
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--obsidian-border)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20" />
        
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
          <div className="sticky top-[3.5rem] z-20 bg-[var(--obsidian-bg)]/80 backdrop-blur-md py-4 border-b border-[var(--obsidian-border)] -mx-6 px-6">
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
            {isLoading ? (
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
      </main>
    </DashboardLayout>
  );
}
