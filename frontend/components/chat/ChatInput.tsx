'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Command as CommandIcon, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ChatInput({ onSend, disabled, loading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !disabled && !loading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative group">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ENTER_COMMAND_>"
          rows={1}
          className={cn(
            "w-full resize-none border border-primary/20 bg-[var(--obsidian-bg)] py-4 pl-5 pr-24 text-[13px] font-mono leading-relaxed text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all duration-300 disabled:opacity-50 min-h-[56px] shadow-[0_0_15px_rgba(99,102,241,0.05)]",
            "hover:border-primary/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]",
            message.trim() && "border-primary/40 shadow-primary/10"
          )}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 opacity-20 group-focus-within:opacity-40 transition-opacity">
                <CommandIcon className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold">ENTER</span>
            </div>
            <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || disabled || loading}
                className={cn(
                    "h-8 w-8 rounded bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20",
                    !message.trim() && "bg-[var(--obsidian-card)] text-muted-foreground/40"
                )}
            >
                {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <ArrowUp className="h-4 w-4" />
                )}
            </Button>
        </div>
      </form>
      
      {/* Decorative Input Bottom Line */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-primary/40 transition-all duration-500 origin-left" style={{ width: message.trim() ? '100%' : '0%' }} />
    </div>
  );
}
