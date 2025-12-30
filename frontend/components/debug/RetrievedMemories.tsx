'use client';

import { Badge } from '@/components/ui/badge';
import type { RetrievedMemory } from '@/types';
import { cn } from '@/lib/utils';
import { Database, Clock, Zap } from 'lucide-react';

interface RetrievedMemoriesProps {
  memories: RetrievedMemory[];
}

const typeColors: Record<string, string> = {
  identity: 'text-purple-400 border-purple-500/30',
  preference: 'text-blue-400 border-blue-500/30',
  fact: 'text-green-400 border-green-500/30',
  event: 'text-amber-400 border-amber-500/30',
  context: 'text-slate-400 border-slate-500/30',
};

export function RetrievedMemories({ memories }: RetrievedMemoriesProps) {
  if (memories.length === 0) {
    return (
      <p className="text-[10px] text-muted-foreground font-medium italic text-center py-2">No relevant context retrieved.</p>
    );
  }

  return (
    <div className="space-y-2">
      {memories.map((memory) => (
        <div
          key={memory.id}
          className="rounded-sm border border-[var(--obsidian-border)] bg-[var(--obsidian-card)]/50 p-3 hover:border-primary/20 transition-all group"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-[12px] font-medium leading-relaxed text-foreground/90">
              {memory.text}
            </p>
            <Badge
              variant="outline"
              className={cn("text-[8px] uppercase tracking-tighter px-1.5 py-0 h-4 font-bold whitespace-nowrap", typeColors[memory.type] || typeColors.fact)}
            >
              {memory.type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-[9px] uppercase font-bold tracking-widest text-[var(--obsidian-stat-label)] border-t border-[var(--obsidian-border)]/50 pt-2 mt-2">
            <div className="flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 text-primary" />
                Score: {(memory.hybrid_score || 0).toFixed(3)}
            </div>
            <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-primary" />
                Recall: {memory.access_count}x
            </div>
            <div className="ml-auto text-[8px] font-mono text-muted-foreground/40">
                {memory.id.slice(0, 8)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
