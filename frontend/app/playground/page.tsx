'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, Header } from '@/components/layout';
import { ChatPanel } from '@/components/chat';
import { DebugPanel } from '@/components/debug';
import { Button } from '@/components/ui/button';
import { useAuthStore, useUIStore, useChatStore, useConfigStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Trash2, Download, AlertCircle } from 'lucide-react';
import type { Message, DebugInfo } from '@/types';

export default function PlaygroundPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { debugPanelOpen } = useUIStore();
  const { apiConfig } = useConfigStore();
  const {
    messages,
    sessionStats,
    addMessage,
    updateStats,
    clearChat,
    isStreaming,
    setStreaming,
  } = useChatStore();

  const [selectedMessageId, setSelectedMessageId] = useState<string>();
  const [currentDebug, setCurrentDebug] = useState<DebugInfo>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const hasApiKeys = apiConfig.openai_key && apiConfig.supabase_url;

  const handleSendMessage = async (content: string) => {
    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setSelectedMessageId(userMessage.id);
    setStreaming(true);

    try {
      // TODO: Replace with actual API call
      // For now, simulate a response with mock debug data
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockDebug: DebugInfo = {
        tokens_in: Math.floor(Math.random() * 100) + 50,
        tokens_out: Math.floor(Math.random() * 150) + 80,
        latency_ms: Math.floor(Math.random() * 300) + 200,
        cost: Math.random() * 0.001,
        extracted_facts: content.toLowerCase().includes('i am') || content.toLowerCase().includes("i'm")
          ? [
              {
                text: content.match(/(?:i am|i'm)\s+(\w+(?:\s+\w+)*)/i)?.[0] || 'Unknown fact',
                type: 'identity',
                confidence: 0.92,
                category: 'personal',
              },
            ]
          : [],
        decisions: content.toLowerCase().includes('i am') || content.toLowerCase().includes("i'm")
          ? [
              {
                action: 'ADD',
                reason: 'New identity fact extracted from conversation',
              },
            ]
          : [
              {
                action: 'NONE',
                reason: 'No actionable facts detected in message',
              },
            ],
        retrieved_memories: [
          {
            id: 'mem_1',
            text: 'Previous context about the user',
            type: 'context',
            confidence: 0.85,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            access_count: 5,
            status: 'active',
            entities: [],
            hybrid_score: 0.78,
          },
        ],
      };

      setCurrentDebug(mockDebug);

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `I've processed your message. ${
          mockDebug.extracted_facts.length > 0
            ? `I extracted ${mockDebug.extracted_facts.length} fact(s) and stored them in memory.`
            : 'No new facts were extracted from this message.'
        }`,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);

      updateStats({
        total_tokens: sessionStats.total_tokens + mockDebug.tokens_in + mockDebug.tokens_out,
        total_cost: sessionStats.total_cost + mockDebug.cost,
        memories_created: sessionStats.memories_created + mockDebug.extracted_facts.length,
        message_count: sessionStats.message_count + 2,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setStreaming(false);
    }
  };

  const handleExport = () => {
    const data = {
      messages,
      sessionStats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cortex-chat-${Date.now()}.json`;
    a.click();
  };

  return (
    <DashboardLayout>
      <Header title="Playground" showDebugToggle />

      {!hasApiKeys && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-500">API Keys Required</p>
            <p className="text-xs text-amber-500/80">
              Configure your OpenAI and Supabase keys in Settings to enable memory features.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/settings')}
            className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
          >
            Configure
          </Button>
        </div>
      )}

      <div className="flex h-[calc(100vh-3.5rem)] flex-1">
        {/* Chat Panel */}
        <div
          className={cn(
            'flex flex-col transition-all duration-300',
            debugPanelOpen ? 'w-[60%]' : 'w-full'
          )}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-end gap-2 border-b border-border px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={messages.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              messages={messages}
              selectedMessageId={selectedMessageId}
              onMessageSelect={setSelectedMessageId}
              onSendMessage={handleSendMessage}
              loading={isStreaming}
            />
          </div>
        </div>

        {/* Debug Panel */}
        {debugPanelOpen && (
          <div className="w-[40%]">
            <DebugPanel debugInfo={currentDebug} sessionStats={sessionStats} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
