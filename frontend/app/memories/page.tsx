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
      <Header title="Memories" />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6">
          <MemoryFilter
            search={search}
            onSearchChange={setSearch}
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Memory List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-xl bg-muted p-4">
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No memories found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {search || selectedTypes.length > 0
                ? 'Try adjusting your filters or search query.'
                : 'Start a conversation in the Playground to create memories.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredMemories.length} memor{filteredMemories.length === 1 ? 'y' : 'ies'}
            </p>
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
