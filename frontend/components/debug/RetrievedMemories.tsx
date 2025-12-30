'use client';

import { Badge } from '@/components/ui/badge';
import type { RetrievedMemory } from '@/types';

interface RetrievedMemoriesProps {
  memories: RetrievedMemory[];
}

export function RetrievedMemories({ memories }: RetrievedMemoriesProps) {
  if (memories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No memories retrieved</p>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((memory, index) => (
        <div
          key={memory.id || index}
          className="rounded-lg border border-border bg-background/50 p-3"
        >
          <p className="text-sm text-foreground">&quot;{memory.text}&quot;</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {memory.type}
            </Badge>
            {memory.rerank_score !== undefined && (
              <span className="text-xs text-muted-foreground">
                Rerank: {memory.rerank_score.toFixed(3)}
              </span>
            )}
            {memory.hybrid_score !== undefined && (
              <span className="text-xs text-muted-foreground">
                Hybrid: {memory.hybrid_score.toFixed(3)}
              </span>
            )}
            {memory.similarity !== undefined && (
              <span className="text-xs text-muted-foreground">
                Similarity: {memory.similarity.toFixed(3)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
