import Link from 'next/link';
import { Database, Zap, GitBranch, ArrowRight, MessageSquare, Shield, Cpu, Activity, Terminal, Code, Cpu as CpuIcon, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020202] text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Neural Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-[#121212] bg-[#020202]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={24} />
            <span className="text-sm font-bold tracking-[0.3em] uppercase pt-0.5 group-hover:text-primary transition-colors">Cortex</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Access_Terminal
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-8 rounded-sm bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest px-4 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                Initialize_System
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative pt-48 pb-32">
          {/* Indigo Pulse */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
          
          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <div className="mx-auto mb-10 flex w-fit items-center gap-3 border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Status: Neural_Graph_Ready</span>
            </div>
            
            <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-[-0.04em] leading-[0.95] sm:text-8xl">
              PERSISTENT MEMORY<br />
              <span className="text-primary italic tracking-tightest">FOR INTELLIGENT AGENTS_</span>
            </h1>
            
            <p className="mx-auto mt-10 max-w-2xl text-[13px] leading-relaxed text-muted-foreground/60 uppercase tracking-widest font-medium">
              A HIGH-PERFORMANCE NEURAL ENGINE THAT DISTILLS UNSTRUCTURED STREAMS <br className="hidden md:block"/> 
              INTO PERMANENT, ALIGNED KNOWLEDGE GRAPHS.
            </p>
            
            <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-10 rounded-none bg-primary hover:bg-primary/90 text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                  DEPLOY_CORTEX
                </Button>
              </Link>
              <Link href="/playground">
                <Button variant="outline" size="lg" className="h-12 px-10 rounded-none border-[#121212] bg-white/[0.02] hover:bg-white/[0.05] text-xs font-bold uppercase tracking-[0.2em] group">
                  Open_Terminal
                  <ArrowRight className="ml-3 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="py-24 border-y border-[#121212] bg-[#050505]/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-16 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#121212]">
              {[
                { 
                  icon: CpuIcon, 
                  title: 'EXTRACTION_OPS', 
                  desc: 'Autodistill raw streams into atomic facts and high-fidelity user preferences in real-time.' 
                },
                { 
                  icon: Layers, 
                  title: 'NEURAL_ALIGNMENT', 
                  desc: 'Intelligent conflict resolution engine that synchronizes contradictory nodes across the graph.' 
                },
                { 
                  icon: Database, 
                  title: 'HYBRID_VAULT', 
                  desc: 'Sub-15ms context retrieval via RRF-powered unified vector and semantic search pathways.' 
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-6 pt-12 md:pt-0 md:pl-12 first:pt-0 first:pl-0">
                  <div className="h-8 w-8 rounded-sm bg-primary/5 border border-primary/20 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">{item.title}</h3>
                    <p className="text-[11px] leading-relaxed text-muted-foreground/50 uppercase tracking-widest font-medium">
                        {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Traces */}
        <section className="py-32 overflow-hidden relative">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20 border-b border-[#121212] pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Code className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">System_Capabilities</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl uppercase leading-none">
                        Precision_Intelligence_
                    </h2>
                </div>
                <p className="max-w-md text-[11px] text-muted-foreground/40 uppercase tracking-widest leading-relaxed">
                    Designed for production agents requiring high-reliability long-term memory and zero-latency context alignment.
                </p>
            </div>

            <div className="grid gap-px bg-[#121212] md:grid-cols-2 lg:grid-cols-4 border border-[#121212]">
              {[
                { icon: MessageSquare, title: 'DISTILL', desc: 'Convert noise to signal' },
                { icon: GitBranch, title: 'SYNC', desc: 'Resolve graph collisions' },
                { icon: Terminal, title: 'EXEC', desc: 'Scriptable memory hooks' },
                { icon: Zap, title: 'STREAM', desc: 'Edge-cached recall' },
              ].map((f, i) => (
                <div key={i} className="group relative bg-[#020202] p-10 hover:bg-white/[0.01] transition-colors">
                  <div className="mb-6 inline-flex h-10 w-10 items-center justify-center bg-[#050505] border border-[#121212]">
                    <f.icon className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">{f.title}</h3>
                  <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#121212] py-20 bg-[#020202]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-12 sm:flex-row">
            <div className="flex items-center gap-4 group cursor-pointer grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <Logo size={24} />
              <span className="text-sm font-bold tracking-[0.3em] uppercase pt-0.5">Cortex</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-10 text-[9px] text-muted-foreground/40 uppercase tracking-[0.25em] font-bold">
              <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-primary transition-colors">API_Reference</Link>
              <Link href="#" className="hover:text-primary transition-colors">Control_Plane</Link>
              <Link href="#" className="hover:text-primary transition-colors">Source</Link>
            </nav>
            <div className="text-right">
                <p className="text-[9px] text-muted-foreground/20 font-mono font-bold tracking-widest">
                    © 2025 CORTEX_RESEARCH_FOUNDATION
                </p>
                <p className="text-[8px] text-primary/40 font-mono mt-1 font-bold uppercase tracking-widest">
                    [Awaiting_Input]
                </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
