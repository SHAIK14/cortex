'use client';

import { cn } from '@/lib/utils';
import { Brain, User } from 'lucide-react';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isSelected?: boolean;
  onClick?: () => void;
}

export function MessageBubble({ message, isSelected, onClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 transition-colors',
        isUser ? 'bg-transparent' : 'bg-muted/30',
        isSelected && 'bg-primary/5 ring-1 ring-primary/20',
        onClick && 'cursor-pointer hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isUser ? 'bg-primary/10' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary" />
        ) : (
          <Brain className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          {isUser ? 'You' : 'Cortex'}
        </p>
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
