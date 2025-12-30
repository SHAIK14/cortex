'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import type { Message } from '@/types';
import { MessageSquare } from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  selectedMessageId?: string;
  onMessageSelect?: (id: string) => void;
  onSendMessage: (content: string) => void;
  loading?: boolean;
}

export function ChatPanel({
  messages,
  selectedMessageId,
  onMessageSelect,
  onSendMessage,
  loading,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="rounded-xl bg-muted p-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Start a conversation
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Send a message to see memory extraction in action. The debug panel
              will show extracted facts, decisions, and retrieved memories.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSelected={message.id === selectedMessageId}
                onClick={() => onMessageSelect?.(message.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      <ChatInput onSend={onSendMessage} loading={loading} />
    </div>
  );
}
