'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  messages: Message[];
  selectedMessageId?: string;
  onMessageSelect?: (id: string) => void;
  onSendMessage: (content: string) => void;
  loading?: boolean;
}

import { useSound } from '@/components/layout/SoundProvider';

export function ChatPanel({
  messages,
  selectedMessageId,
  onMessageSelect,
  loading,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();
  const lastMessageCount = useRef(messages.length);

  useEffect(() => {
    if (messages.length > lastMessageCount.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        playSound('extraction');
      }
    }
    lastMessageCount.current = messages.length;
  }, [messages, playSound]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => playSound('thinking'), 800);
      return () => clearInterval(interval);
    }
  }, [loading, playSound]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full w-full" ref={scrollRef}>
        <div className="flex flex-col min-h-full">
            <div className="flex-1 divide-y divide-[#121212]">
                {messages.map((message) => (
                <MessageBubble
                    key={message.id}
                    message={message}
                    isSelected={message.id === selectedMessageId}
                    onClick={() => onMessageSelect?.(message.id)}
                />
                ))}
            </div>
            {/* Scroll bottom spacer */}
            <div className="h-4 w-full flex-shrink-0" />
        </div>
    </ScrollArea>
  );
}
