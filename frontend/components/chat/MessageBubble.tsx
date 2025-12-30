'use client';

import { cn } from '@/lib/utils';
import { User, Terminal } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
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
        'group flex gap-5 px-6 py-5 transition-all duration-300 border-b border-[var(--obsidian-border)] relative',
        isUser ? 'bg-transparent' : 'bg-[var(--obsidian-card)]/50',
        isSelected && 'bg-primary/5',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
      )}

      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[var(--obsidian-border)]',
          isUser ? 'bg-[var(--obsidian-bg)]' : 'bg-primary/10 border-primary/20'
        )}
      >
        {isUser ? (
          <Terminal className="h-4 w-4 text-muted-foreground/40" />
        ) : (
          <Logo size={18} />
        )}
      </div>
      
      <div className="flex-1 space-y-2 min-w-0 font-mono">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <p className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em]",
                    isUser ? "text-[var(--obsidian-stat-label)]" : "text-primary/80"
                )}>
                {isUser ? 'OPERATOR_CTX' : 'CORTEX_INTEL'}
                </p>
                <div className="h-0.5 w-0.5 rounded-full bg-[var(--obsidian-border)]" />
                {message.timestamp && (
                    <span className="text-[9px] font-bold text-[var(--obsidian-stat-label)] uppercase tracking-widest">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                )}
            </div>
            {isUser && <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest px-2 py-0.5 border border-primary/30 rounded-none bg-primary/5">Verified</span>}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap font-medium font-sans tracking-tight">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
