'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Clock, Eye } from 'lucide-react';
import type { Memory } from '@/types';
import { formatDistanceToNow } from '@/lib/utils';

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
    <Card className="border-border bg-card transition-colors hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-sm text-foreground">&quot;{memory.text}&quot;</p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={typeColors[memory.type] || typeColors.fact}
              >
                {memory.type}
              </Badge>

              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-medium">{(memory.confidence * 100).toFixed(0)}%</span>
                confidence
              </span>

              {memory.category && (
                <Badge variant="secondary" className="text-xs">
                  {memory.category}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(memory.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {memory.access_count} accesses
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            {onSelect && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onSelect(memory)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(memory.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
