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
import { Clock, Coins, Cpu, Database, Brain, GitBranch, Activity, Zap, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugPanelProps {
  debugInfo?: DebugInfo;
  sessionStats: SessionStats;
}

export function DebugPanel({ debugInfo, sessionStats }: DebugPanelProps) {
  return (
    <div className="flex h-full flex-col bg-[var(--obsidian-bg)] font-mono">
      <ScrollArea className="flex-1">
        <div className="divide-y divide-[var(--obsidian-border)]">
          
          {/* Operational Metrics Section */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Layers className="h-3 w-3 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">System_Metrics</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'RT_LATENCY', value: debugInfo ? `${debugInfo.latency_ms}ms` : '---', icon: Zap },
                    { label: 'TOKEN_LOAD', value: debugInfo ? (debugInfo.tokens_in + debugInfo.tokens_out) : '---', icon: Cpu },
                    { label: 'SESSION_COST', value: `$${sessionStats.total_cost.toFixed(5)}`, icon: Coins },
                    { label: 'MEM_COUNT', value: sessionStats.memories_created, icon: Database },
                ].map((m, i) => (
                    <div key={i} className="p-3 bg-[var(--obsidian-card)] border border-[var(--obsidian-border)] rounded group hover:border-primary/30 transition-colors shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            <m.icon className="h-2.5 w-2.5 text-primary" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">{m.label}</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">{m.value}</p>
                    </div>
                ))}
            </div>
          </div>

          {/* Trace Accordion */}
          <Accordion type="multiple" defaultValue={['facts', 'decisions', 'memories']} className="px-0">
            
            {/* Knowledge Distilled */}
            <AccordionItem value="facts" className="border-none px-4 group">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest hover:no-underline py-4 text-muted-foreground group-data-[state=open]:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  <Brain className="h-3 w-3 text-primary" />
                  Fact_Extraction
                  {debugInfo && debugInfo.extracted_facts.length > 0 && (
                    <span className="ml-2 text-[9px] opacity-40">({debugInfo.extracted_facts.length})</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                {debugInfo ? (
                  <ExtractedFacts facts={debugInfo.extracted_facts} />
                ) : (
                  <div className="py-8 text-center border border-dashed border-[var(--obsidian-border)] rounded opacity-40">
                    <p className="text-[9px] font-bold uppercase tracking-widest">Awaiting Trace_</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Decisions */}
            <AccordionItem value="decisions" className="border-none px-4 group">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest hover:no-underline py-4 text-muted-foreground group-data-[state=open]:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3 w-3 text-primary" />
                  Neural_Pathways
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                {debugInfo ? (
                  <DecisionDisplay decisions={debugInfo.decisions} />
                ) : (
                   <div className="py-8 text-center border border-dashed border-[var(--obsidian-border)] rounded opacity-40">
                    <p className="text-[9px] font-bold uppercase tracking-widest">No Active Decision_</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Memories */}
            <AccordionItem value="memories" className="border-none px-4 group">
              <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest hover:no-underline py-4 text-muted-foreground group-data-[state=open]:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3 text-primary" />
                  Context_Recall
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                {debugInfo ? (
                  <RetrievedMemories memories={debugInfo.retrieved_memories} />
                ) : (
                   <div className="py-8 text-center border border-dashed border-[var(--obsidian-border)] rounded opacity-40">
                    <p className="text-[9px] font-bold uppercase tracking-widest">Zero Recall Detected_</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </ScrollArea>
      
      {/* Footer Branding */}
      <div className="p-4 border-t border-[var(--obsidian-border)] flex items-center justify-between opacity-50">
        <span className="text-[8px] font-bold tracking-[0.3em] uppercase">System_Active</span>
        <div className="flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-bold uppercase tracking-widest leading-none pt-0.5">X-Link Established</span>
        </div>
      </div>
    </div>
  );
}
