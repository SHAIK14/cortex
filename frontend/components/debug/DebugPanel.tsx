'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExtractedFacts } from './ExtractedFacts';
import { DecisionDisplay } from './DecisionDisplay';
import { RetrievedMemories } from './RetrievedMemories';
import type { DebugInfo, SessionStats } from '@/types';
import { Clock, Coins, Cpu, Database, Brain, GitBranch } from 'lucide-react';

interface DebugPanelProps {
  debugInfo?: DebugInfo;
  sessionStats: SessionStats;
}

export function DebugPanel({ debugInfo, sessionStats }: DebugPanelProps) {
  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Debug Panel</h2>
        <p className="text-xs text-muted-foreground">
          Real-time memory extraction info
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={['message', 'facts', 'decisions', 'memories', 'session']} className="space-y-2">
            {/* Current Message Stats */}
            {debugInfo && (
              <AccordionItem value="message" className="border-border">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    This Message
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="rounded-lg border border-border bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground">Tokens In</p>
                      <p className="text-lg font-semibold text-foreground">
                        {debugInfo.tokens_in}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground">Tokens Out</p>
                      <p className="text-lg font-semibold text-foreground">
                        {debugInfo.tokens_out}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground">Latency</p>
                      <p className="text-lg font-semibold text-foreground">
                        {debugInfo.latency_ms}ms
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-mono text-foreground">
                      ${debugInfo.cost.toFixed(6)}
                    </span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Extracted Facts */}
            <AccordionItem value="facts" className="border-border">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  Extracted Facts
                  {debugInfo && debugInfo.extracted_facts.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {debugInfo.extracted_facts.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {debugInfo ? (
                  <ExtractedFacts facts={debugInfo.extracted_facts} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Send a message to see extracted facts
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Decisions */}
            <AccordionItem value="decisions" className="border-border">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  Decisions
                  {debugInfo && debugInfo.decisions.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {debugInfo.decisions.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {debugInfo ? (
                  <DecisionDisplay decisions={debugInfo.decisions} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Send a message to see decisions
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Retrieved Memories */}
            <AccordionItem value="memories" className="border-border">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  Retrieved Memories
                  {debugInfo && debugInfo.retrieved_memories.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {debugInfo.retrieved_memories.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {debugInfo ? (
                  <RetrievedMemories memories={debugInfo.retrieved_memories} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Send a message to see retrieved memories
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Session Stats */}
            <AccordionItem value="session" className="border-border">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Session Stats
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg border border-border bg-background/50 p-3">
                    <p className="text-xs text-muted-foreground">Total Tokens</p>
                    <p className="text-lg font-semibold text-foreground">
                      {sessionStats.total_tokens.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-3">
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-semibold text-foreground">
                      ${sessionStats.total_cost.toFixed(4)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-3">
                    <p className="text-xs text-muted-foreground">Memories Created</p>
                    <p className="text-lg font-semibold text-foreground">
                      {sessionStats.memories_created}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-3">
                    <p className="text-xs text-muted-foreground">Messages</p>
                    <p className="text-lg font-semibold text-foreground">
                      {sessionStats.message_count}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
