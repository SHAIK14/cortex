'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Clock, Eye } from 'lucide-react';
import type { Memory } from '@/types';
import { formatDistanceToNow, cn } from '@/lib/utils';

interface MemoryCardProps {
  memory: Memory;
  onDelete?: (id: string) => void;
  onSelect?: (memory: Memory) => void;
}

const typeColors: Record<string, string> = {
  identity: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  preference: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  fact: 'bg-green-500/10 text-green-500 border-green-500/20',
  event: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  context: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export function MemoryCard({ memory, onDelete, onSelect }: MemoryCardProps) {
  return (
    <div className="obsidian-card group relative p-5 rounded-none border border-[var(--obsidian-border)] bg-[var(--obsidian-card)] transition-all duration-300 hover:border-primary/40 hover:shadow-indigo-glow cursor-default overflow-hidden">
      {/* Type Marker Accessory */}
      <div className={cn("absolute top-0 right-0 h-1 w-12", 
        memory.type === 'identity' ? 'bg-purple-500/50' : 
        memory.type === 'preference' ? 'bg-blue-500/50' : 
        memory.type === 'fact' ? 'bg-green-500/50' :
        memory.type === 'event' ? 'bg-amber-500/50' : 'bg-slate-500/50'
      )} />

      <div className="flex flex-col h-full gap-4">
        <div className="flex items-start justify-between gap-4">
          <Badge
            variant="outline"
            className={cn("text-[9px] uppercase tracking-widest font-bold px-1.5 py-0 rounded-none border-primary/20", typeColors[memory.type] || typeColors.fact)}
          >
            {memory.type}
          </Badge>
          
          <div className="flex items-center gap-1">
            <button 
                onClick={() => onDelete?.(memory.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all text-muted-foreground/40"
            >
                <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-[13px] font-medium leading-relaxed text-foreground/90 font-sans tracking-tight">
            &quot;{memory.text}&quot;
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-[var(--obsidian-border)]">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--obsidian-stat-label)]">
            <div className="flex items-center gap-1.5">
                <Clock className="h-2.5 w-2.5" />
                {formatDistanceToNow(memory.created_at)}
            </div>
            <div className="flex items-center gap-1.5">
                <Eye className="h-2.5 w-2.5" />
                {memory.access_count}X_RECALL
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                <span>CONFIDENCE_LEVEL</span>
                <span className="text-primary">{(memory.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1 w-full bg-[var(--obsidian-border)]/50 rounded-none overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${memory.confidence * 100}%` }}
                />
            </div>
          </div>

          {/* Entities Trace */}
          {memory.entities && memory.entities.length > 0 && (
            <div className="flex flex-wrap gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                {memory.entities.slice(0, 3).map((entity, i) => (
                    <span key={i} className="text-[7px] bg-[var(--obsidian-border)] text-foreground/80 px-1 py-0.5 rounded-none uppercase font-bold tracking-tighter">
                        {entity}
                    </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
