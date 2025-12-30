'use client';

import { Badge } from '@/components/ui/badge';
import type { ExtractedFact } from '@/types';
import { cn } from '@/lib/utils';
import { Target, Fingerprint, Database, Zap, Activity } from 'lucide-react';

interface ExtractedFactsProps {
  facts: ExtractedFact[];
}

const typeColors: Record<string, string> = {
  identity: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  preference: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  fact: 'text-green-400 border-green-400/30 bg-green-400/10',
  event: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  context: 'text-slate-400 border-slate-400/30 bg-slate-400/10',
};

export function ExtractedFacts({ facts }: ExtractedFactsProps) {
  if (facts.length === 0) return null;

  return (
    <div className="space-y-3">
      {facts.map((fact, index) => (
        <div
          key={index}
          className="p-3 bg-[var(--obsidian-card)]/50 border border-[var(--obsidian-border)] rounded-sm group hover:border-primary/20 transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <p className="text-[11px] font-medium leading-relaxed text-foreground/80 font-sans tracking-tight">
              &quot;{fact.text}&quot;
            </p>
            <Badge
              variant="outline"
              className={cn("text-[8px] uppercase tracking-widest px-1 py-0 h-3.5 font-bold rounded-none", typeColors[fact.type] || typeColors.fact)}
            >
              {fact.type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-[9px] font-bold tracking-widest text-[var(--obsidian-stat-label)] uppercase">
            <span className="flex items-center gap-1.5">
                <Target className="h-2.5 w-2.5 text-primary/50" />
                CONF_{ (fact.confidence * 100).toFixed(0) }%
            </span>
            {fact.category && (
                <span className="flex items-center gap-1.5 text-primary/40">
                    <Fingerprint className="h-2.5 w-2.5" />
                    {fact.category}
                </span>
            )}
          </div>

          {fact.entities && fact.entities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              {fact.entities.map((entity, i) => (
                <span key={i} className="text-[8px] bg-primary/5 text-primary/80 px-2 py-0.5 rounded-none border border-primary/20 font-bold uppercase tracking-widest">
                  {entity}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
