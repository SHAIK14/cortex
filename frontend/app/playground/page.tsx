'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout, Header } from '@/components/layout';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ChatInput } from '@/components/chat/ChatInput';
import { DebugPanel } from '@/components/debug/DebugPanel';
import { Button } from '@/components/ui/button';
import { useAuthStore, useUIStore, useChatStore, useConfigStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Settings, 
  ChevronRight, 
  Cpu, 
  Database,
  Command as CommandIcon,
  Search,
  Maximize2,
  Minimize2,
  Eraser,
  Download,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import type { Message, DebugInfo } from '@/types';

export default function PlaygroundPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { debugPanelOpen, toggleDebugPanel } = useUIStore();
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

  if (!isAuthenticated) return null;

  const hasApiKeys = apiConfig.openai_key && apiConfig.supabase_url;

  const handleSendMessage = async (content: string) => {
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
      // Simulate API Trace
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockDebug: DebugInfo = {
        tokens_in: 42,
        tokens_out: 86,
        latency_ms: 184,
        cost: 0.00018,
        extracted_facts: [
            { text: "User prefers dark themes", type: "preference", confidence: 0.98, category: "UI" }
        ],
        decisions: [
            { action: "ADD", reason: "Identified new stable user preference" }
        ],
        retrieved_memories: []
      };

      setCurrentDebug(mockDebug);

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `Intelligence processed. Extracted 1 new fact and synchronized with neural graph. Path latency: 184ms.`,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);

      updateStats({
        total_tokens: sessionStats.total_tokens + 128,
        total_cost: sessionStats.total_cost + 0.00018,
        memories_created: sessionStats.memories_created + 1,
        message_count: sessionStats.message_count + 2,
      });
    } catch (error) {
      console.error('Extraction error:', error);
    } finally {
      setStreaming(false);
    }
  };

  const handleExport = () => {
    const data = { messages, sessionStats, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cortex-trace-${Date.now()}.json`;
    a.click();
  };

  return (
    <DashboardLayout>
      <Header title="Neural Terminal" showDebugToggle />

      <main className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-[var(--obsidian-bg)]">
        
        {/* Terminal Area */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-[var(--obsidian-border)]",
          debugPanelOpen ? "w-[60%]" : "w-full"
        )}>
          
          {/* Console Header */}
          <div className="h-10 border-b border-[var(--obsidian-border)] flex items-center justify-between px-4 bg-[var(--obsidian-card)]">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">Cortex_Console_v2.0</span>
                </div>
                {!hasApiKeys && (
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        <ShieldAlert className="h-3 w-3 text-amber-500" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500">Offline</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleExport} disabled={messages.length === 0} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <Download className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" onClick={clearChat} disabled={messages.length === 0} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-hidden relative">
            {messages.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="max-w-md w-full space-y-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Cpu className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Awaiting Operators Command_</h3>
                            <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-wider font-medium opacity-40">
                                INITIALIZE NEURAL SESSION BY SENDING A COMMAND. CORTEX WILL EXTRACT KNOWLEDGE AND ALIGN WITH EXISTING MEMORY VAULTS.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <ChatPanel 
                  messages={messages}
                  selectedMessageId={selectedMessageId}
                  onMessageSelect={setSelectedMessageId}
                  onSendMessage={handleSendMessage}
                  loading={isStreaming}
                />
            )}
          </div>

          {/* Command Input Area */}
          <div className="p-4 bg-[var(--obsidian-bg)]/40 border-t border-[var(--obsidian-border)]">
             <div className="max-w-4xl mx-auto w-full">
                <ChatInput onSend={handleSendMessage} loading={isStreaming} />
             </div>
          </div>
        </div>

        {/* Intelligence Trace Panel */}
        <AnimatePresence>
          {debugPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '40%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="h-full border-l border-[var(--obsidian-border)] bg-[var(--obsidian-bg)] flex flex-col"
            >
              <div className="h-10 border-b border-[var(--obsidian-border)] flex items-center justify-between px-4 bg-[var(--obsidian-card)]">
                <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">Intelligence_Trace</span>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 hover:bg-white/[0.03]"
                    onClick={toggleDebugPanel}
                >
                    <Minimize2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <DebugPanel debugInfo={currentDebug} sessionStats={sessionStats} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </DashboardLayout>
  );
}
