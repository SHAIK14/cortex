'use client';

import { Badge } from '@/components/ui/badge';
import type { Decision } from '@/types';
import { Plus, RefreshCw, Trash2, AlertTriangle, Minus } from 'lucide-react';

interface DecisionDisplayProps {
  decisions: Decision[];
}

const actionConfig = {
  ADD: {
    icon: Plus,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    label: 'Added',
  },
  UPDATE: {
    icon: RefreshCw,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    label: 'Updated',
  },
  DELETE: {
    icon: Trash2,
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    label: 'Deleted',
  },
  CONFLICT: {
    icon: AlertTriangle,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    label: 'Conflict',
  },
  NONE: {
    icon: Minus,
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    label: 'No Action',
  },
};

export function DecisionDisplay({ decisions }: DecisionDisplayProps) {
  if (decisions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No decisions made</p>
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((decision, index) => {
        const config = actionConfig[decision.action];
        const Icon = config.icon;

        return (
          <div
            key={index}
            className="rounded-lg border border-border bg-background/50 p-3"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={config.color}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {decision.reason}
            </p>
            {decision.new_text && (
              <p className="mt-2 text-sm text-foreground">
                &quot;{decision.new_text}&quot;
              </p>
            )}
            {decision.new_confidence !== undefined && (
              <p className="mt-1 text-xs text-muted-foreground">
                New confidence: {(decision.new_confidence * 100).toFixed(0)}%
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
