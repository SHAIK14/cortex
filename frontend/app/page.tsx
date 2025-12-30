'use client';

import Link from 'next/link';
import { Database, Zap, GitBranch, ArrowRight, MessageSquare, Shield, Cpu, Activity, Terminal, Code, Cpu as CpuIcon, Layers, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { NeuralBackground } from '@/components/memories/NeuralBackground';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--obsidian-bg)] text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">
      <NeuralBackground />

      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-[var(--obsidian-border)] bg-[var(--obsidian-header)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={24} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase pt-0.5 group-hover:text-primary transition-colors">Cortex_V2</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/login" className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
              [ Access_Terminal ]
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-8 rounded-none bg-primary hover:bg-primary/90 text-[9px] font-bold uppercase tracking-[0.2em] px-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                Initialize_Nexus
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="relative pt-48 pb-32">
          {/* Animated Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] -z-10 pointer-events-none" />
          
          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mb-10 flex w-fit items-center gap-3 border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary">System_Ready: Neural_Engine_Active</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-5xl text-5xl font-bold tracking-[-0.04em] leading-[0.9] sm:text-8xl uppercase"
            >
              <ScrambleText text="PERSISTENT_MEMORY" triggerOn="load" className="block" /><br />
              <span className="text-primary italic tracking-tightest">FOR_AGENTS_</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-12 max-w-2xl text-[11px] leading-relaxed text-muted-foreground/50 uppercase tracking-[0.3em] font-bold"
            >
              The High-Fidelity Neural Layer That Distills Raw Machine Context Into permanent, Synchronized Knowledge Structures.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row"
            >
              <Link href="/signup">
                <Button size="lg" className="h-12 px-10 rounded-none bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-primary/20">
                  Deploy_Cortex_Instance
                </Button>
              </Link>
              <Link href="/playground">
                <Button variant="outline" size="lg" className="h-12 px-10 rounded-none border-[var(--obsidian-border)] bg-[var(--obsidian-bg)]/50 hover:bg-[var(--obsidian-hover)] text-[10px] font-bold uppercase tracking-[0.3em] group">
                  Initialize_terminal
                  <ChevronRight className="ml-3 h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-primary" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="py-32 border-y border-[var(--obsidian-border)] bg-[var(--obsidian-bg)]/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {[
                { 
                  icon: CpuIcon, 
                  title: 'EXTRACTION_OPS', 
                  desc: 'Autodistill raw signal from unstructured noise into atomic factual weights in real-time.' 
                },
                { 
                  icon: Layers, 
                  title: 'NEURAL_ALIGNMENT', 
                  desc: 'Proprietary conflict resolution engine that maintains absolute semantic integrity across sessions.' 
                },
                { 
                  icon: Database, 
                  title: 'HYBRID_VAULT', 
                  desc: 'Sub-15ms memory retrieval via RRF-powered unified vector and semantic search pathways.' 
                }
              ].map((item, i) => (
                <div key={i} className="obsidian-card p-10 group cursor-default">
                  <div className="h-10 w-10 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center mb-8 group-hover:border-primary/50 transition-colors">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">
                        <ScrambleText text={item.title} />
                    </h3>
                    <p className="text-[9px] leading-relaxed text-muted-foreground/40 uppercase tracking-[0.2em] font-bold">
                        {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capability Traces */}
        <section className="py-32 relative">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20 border-b border-[var(--obsidian-border)] pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-primary" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary">Capabilities_Report</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight sm:text-6xl uppercase leading-none italic">
                        Precision_Intelligence_
                    </h2>
                </div>
                <p className="max-w-md text-[10px] text-muted-foreground/30 uppercase tracking-[0.3em] leading-loose font-bold">
                    Designed for production agents requiring high-reliability long-term memory and zero-latency context alignment.
                </p>
            </div>

            <div className="grid gap-px bg-[var(--obsidian-border)] md:grid-cols-2 lg:grid-cols-4 border border-[var(--obsidian-border)]">
              {[
                { icon: MessageSquare, title: 'DISTILL', desc: 'Convert noise to signal' },
                { icon: GitBranch, title: 'SYNC', desc: 'Resolve graph collisions' },
                { icon: Terminal, title: 'EXEC', desc: 'Scriptable memory hooks' },
                { icon: Zap, title: 'STREAM', desc: 'Edge-cached recall' },
              ].map((f, i) => (
                <div key={i} className="group relative bg-[var(--obsidian-bg)] p-12 hover:bg-[var(--obsidian-hover)] transition-all duration-500">
                  <div className="mb-8 inline-flex h-12 w-12 items-center justify-center bg-[var(--obsidian-card)] border border-[var(--obsidian-border)] shadow-xl group-hover:border-primary/30 transition-all">
                    <f.icon className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/80 group-hover:text-primary transition-colors">
                    <ScrambleText text={f.title} />
                  </h3>
                  <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--obsidian-border)] py-24 bg-[var(--obsidian-bg)] relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-16 sm:flex-row">
            <div className="flex items-center gap-4 group cursor-pointer grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <Logo size={24} />
              <span className="text-[11px] font-bold tracking-[0.5em] uppercase pt-0.5">Nexus_Cortex</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-12 text-[9px] text-muted-foreground/30 uppercase tracking-[0.4em] font-bold">
              <Link href="#" className="hover:text-primary transition-colors">Docs</Link>
              <Link href="#" className="hover:text-primary transition-colors">API</Link>
              <Link href="#" className="hover:text-primary transition-colors">Security</Link>
              <Link href="#" className="hover:text-primary transition-colors">Source</Link>
            </nav>
            <div className="text-right">
                <p className="text-[9px] text-muted-foreground/10 font-mono font-bold tracking-widest uppercase">
                    © 2025 Neural_Foundation_LTD
                </p>
                <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="h-1 w-1 rounded-full bg-primary/20" />
                    <p className="text-[8px] text-primary/30 font-mono font-bold uppercase tracking-[0.3em]">
                        Standby_Ready...
                    </p>
                </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
