'use client';

import { Badge } from '@/components/ui/badge';
import type { ExtractedFact } from '@/types';

interface ExtractedFactsProps {
  facts: ExtractedFact[];
}

const typeColors: Record<string, string> = {
  identity: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  preference: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  fact: 'bg-green-500/10 text-green-500 border-green-500/20',
  event: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  context: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export function ExtractedFacts({ facts }: ExtractedFactsProps) {
  if (facts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No facts extracted</p>
    );
  }

  return (
    <div className="space-y-3">
      {facts.map((fact, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-background/50 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-foreground">&quot;{fact.text}&quot;</p>
            <Badge
              variant="outline"
              className={typeColors[fact.type] || typeColors.fact}
            >
              {fact.type}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Confidence: {(fact.confidence * 100).toFixed(0)}%</span>
            {fact.category && <span>Category: {fact.category}</span>}
          </div>
          {fact.entities && fact.entities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {fact.entities.map((entity, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {entity}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
