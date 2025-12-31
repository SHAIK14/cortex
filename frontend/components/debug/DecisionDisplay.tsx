'use client';

import { Badge } from '@/components/ui/badge';
import type { Decision } from '@/types';
import { Plus, RefreshCw, Trash2, AlertTriangle, Minus, GitCommit, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecisionDisplayProps {
  decisions: Decision[];
}

const actionConfig: Record<string, { icon: typeof Plus; color: string; label: string }> = {
  ADD: {
    icon: Plus,
    color: 'text-green-400 border-green-400/30 bg-green-400/10',
    label: 'ADD_LOG',
  },
  UPDATE: {
    icon: RefreshCw,
    color: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    label: 'MERGE_SYNC',
  },
  DELETE: {
    icon: Trash2,
    color: 'text-red-400 border-red-400/30 bg-red-400/10',
    label: 'PRUNE_OPS',
  },
  'DELETE+ADD': {
    icon: RefreshCw,
    color: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    label: 'REPLACE_OP',
  },
  CONFLICT: {
    icon: AlertTriangle,
    color: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    label: 'CONFLICT_ERR',
  },
  NONE: {
    icon: Minus,
    color: 'text-slate-400 border-slate-400/30 bg-slate-400/10',
    label: 'NO_OP',
  },
};

const defaultConfig = {
  icon: Minus,
  color: 'text-slate-400 border-slate-400/30 bg-slate-400/10',
  label: 'UNKNOWN',
};

export function DecisionDisplay({ decisions }: DecisionDisplayProps) {
  if (decisions.length === 0) return null;

  return (
    <div className="space-y-3">
      {decisions.map((decision, index) => {
        const config = actionConfig[decision.action] || defaultConfig;
        const Icon = config.icon;

        return (
          <div
            key={index}
            className="p-3 bg-[var(--obsidian-card)]/50 border border-[var(--obsidian-border)] rounded-sm group hover:border-primary/20 transition-all"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Badge variant="outline" className={cn("text-[8px] uppercase tracking-widest px-1 py-0 h-3.5 font-bold rounded-none", config.color)}>
                <Icon className="mr-1 h-2.5 w-2.5" />
                {config.label}
              </Badge>
            </div>

            {decision.reasoning && (
              <div className="flex gap-2">
                  <GitCommit className="h-3 w-3 text-muted-foreground/20 mt-1 shrink-0" />
                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-medium font-sans tracking-tight">
                  {decision.reasoning}
                  </p>
              </div>
            )}

            {decision.new_text && (
              <div className="mt-3 p-2 bg-[var(--obsidian-bg)] border border-[var(--obsidian-border)] flex items-start gap-2">
                <ArrowRight className="h-2.5 w-2.5 text-primary/40 mt-1 shrink-0" />
                <p className="text-[10px] text-foreground/70 font-mono leading-tight italic">
                    &quot;{decision.new_text}&quot;
                </p>
              </div>
            )}

            {decision.new_confidence !== undefined && (
              <div className="mt-3 flex items-center gap-2 text-[9px] font-bold tracking-widest text-[var(--obsidian-stat-label)] uppercase">
                 <div className="h-1 w-1 rounded-full bg-primary/40" />
                 TARGET_CONFIDENCE_ { (decision.new_confidence * 100).toFixed(0) }%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
