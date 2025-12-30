import { ScrollArea } from '@/components/ui/scroll-area';
import { ExtractedFacts } from './ExtractedFacts';
import { DecisionDisplay } from './DecisionDisplay';
import { RetrievedMemories } from './RetrievedMemories';
import { IntelligenceGraph } from './IntelligenceGraph';
import type { DebugInfo, SessionStats } from '@/types';
import { Coins, Cpu, Database, Brain, GitBranch, Zap, Layers } from 'lucide-react';

interface DebugPanelProps {
  debugInfo?: DebugInfo;
  sessionStats: SessionStats;
}

export function DebugPanel({ debugInfo, sessionStats }: DebugPanelProps) {
  return (
    <div className="flex h-full flex-col bg-[var(--obsidian-bg)] font-mono overflow-hidden">
      <div className="h-1/2 border-b border-[var(--obsidian-border)] relative">
         <IntelligenceGraph debugInfo={debugInfo} />
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-[var(--obsidian-border)]">
          {/* Operational Metrics Section */}
          <div className="p-4 space-y-4 bg-[var(--obsidian-card)]/30">
            <div className="flex items-center gap-2 mb-4">
                <Layers className="h-3 w-3 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">Operational_Metrics</h3>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
                {[
                    { label: 'RT_LATENCY', value: debugInfo ? `${debugInfo.latency_ms}ms` : '---', icon: Zap },
                    { label: 'TOKENS', value: debugInfo ? (debugInfo.tokens_in + debugInfo.tokens_out) : '---', icon: Cpu },
                    { label: 'COST', value: `$${sessionStats.total_cost.toFixed(5)}`, icon: Coins },
                    { label: 'MEMS', value: sessionStats.memories_created, icon: Database },
                ].map((m, i) => (
                    <div key={i} className="p-2 border border-[var(--obsidian-border)] rounded-sm group bg-[var(--obsidian-card)]/50">
                        <p className="text-[7px] font-bold uppercase tracking-widest text-[var(--obsidian-stat-label)] mb-1">{m.label}</p>
                        <p className="text-[10px] font-bold text-foreground">{m.value}</p>
                    </div>
                ))}
            </div>
          </div>

          <div className="px-4 py-6 space-y-8">
            {/* Fact Extraction Detail */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-3 w-3 text-primary" />
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-foreground">KNOWLEDGE_DISTILLED</h4>
                </div>
                {debugInfo && <span className="text-[8px] font-bold text-primary">[{debugInfo.extracted_facts.length}]</span>}
              </div>
              {debugInfo ? (
                <ExtractedFacts facts={debugInfo.extracted_facts} />
              ) : (
                <div className="py-8 text-center border border-dashed border-[var(--obsidian-border)] rounded-sm opacity-20">
                  <p className="text-[8px] font-bold uppercase tracking-widest">AWAITING_NEURAL_PULSE</p>
                </div>
              )}
            </section>

            {/* Pathways Detail */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-3 w-3 text-primary" />
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-foreground">NEURAL_PATHWAYS</h4>
              </div>
              {debugInfo ? (
                <DecisionDisplay decisions={debugInfo.decisions} />
              ) : (
                 <div className="py-8 text-center border border-dashed border-[var(--obsidian-border)] rounded-sm opacity-20">
                  <p className="text-[8px] font-bold uppercase tracking-widest">ACTIVE_RESOLVER_IDLE</p>
                </div>
              )}
            </section>

            {/* Context Detail */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3 text-primary" />
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-foreground">RECALLED_CONTEXT</h4>
              </div>
              {debugInfo ? (
                <RetrievedMemories memories={debugInfo.retrieved_memories} />
              ) : (
                 <div className="py-8 text-center border border-dashed border-[var(--obsidian-border)] rounded-sm opacity-20">
                  <p className="text-[8px] font-bold uppercase tracking-widest">ZERO_HYBRID_RECALL</p>
                </div>
              )}
            </section>
          </div>
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
