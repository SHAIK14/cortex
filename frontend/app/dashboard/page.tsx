'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout, Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Zap, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  GitBranch, 
  Cpu, 
  Globe, 
  Lock,
  Search,
  ChevronRight,
  Workflow,
  Layers,
  Fingerprint,
  Terminal
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NeuralEvent {
  id: string;
  type: 'EXTRACTION' | 'CLASH' | 'SYNC' | 'QUERY';
  target: string;
  timestamp: string;
  confidence: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

import { ScrambleText } from '@/components/ui/ScrambleText';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <Header title="Intelligence Hub" />

      <main className="p-6 max-w-[1600px] mx-auto space-y-8 font-sans">
        
        {/* Hub Header */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--obsidian-border)] pb-8"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tighter text-foreground">
              OPERATOR_<ScrambleText text={user?.email?.split('@')[0].toUpperCase() || 'ROOT'} triggerOn="load" />
            </h2>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                Neural Status: Synchronized
              </span>
              <span className="flex items-center gap-1.5 border-l border-[var(--obsidian-border)] pl-3">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Uptime: 142h 12m
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                size="sm" 
                className="border-[var(--obsidian-border)] bg-[var(--obsidian-bg)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--obsidian-hover)] rounded-none hover:border-primary/50 transition-all font-mono"
                onClick={() => router.push('/settings')}
            >
              Env Config
            </Button>
            <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest px-6 shadow-lg shadow-primary/20 rounded-none h-9"
                onClick={() => router.push('/playground')}
            >
              Initialize Playground
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Status Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Core Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Memories Indexed', value: '1,242', icon: Database, color: 'text-primary' },
                { label: 'Avg Latency', value: '184ms', icon: Zap, color: 'text-amber-500' },
                { label: 'Network Load', value: '24.2%', icon: Cpu, color: 'text-blue-500' },
              ].map((stat, i) => (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="obsidian-card p-5 rounded-sm flex items-center justify-between group cursor-default"
                >
                    <div className="relative z-10">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--obsidian-stat-label)] mb-2 group-hover:text-primary transition-colors">{stat.label}</p>
                        <p className="text-2xl font-mono font-bold text-foreground tracking-tighter">{stat.value}</p>
                    </div>
                    <stat.icon className={cn("h-6 w-6 opacity-10 group-hover:opacity-100 group-hover:text-primary transition-all duration-500", stat.color)} />
                </motion.div>
              ))}
            </div>

            {/* Neural Event Feed */}
            <div className="obsidian-card rounded-lg overflow-hidden flex flex-col h-[500px]">
                <div className="px-5 py-4 border-b border-[var(--obsidian-border)] flex items-center justify-between bg-[var(--obsidian-bg)]/50">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/80 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-primary" />
                        Neural Event stream
                    </h3>
                    <span className="text-[9px] font-mono text-muted-foreground/40 italic">LIVE_FEED_V2.0</span>
                </div>
                <div className="flex-1 p-0 overflow-y-auto font-mono scrollbar-none">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full bg-[var(--obsidian-border)]/20" />)}
                        </div>
                    ) : (
                        <motion.div 
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-[var(--obsidian-border)]"
                        >
                            {[
                                { id: 'EV_942', type: 'EXTRACTION', target: 'entity_94', time: '14:22:01', conf: 0.98 },
                                { id: 'EV_941', type: 'SYNC', target: 'graph_trunk', time: '14:21:44', conf: 1.00 },
                                { id: 'EV_940', type: 'CLASH', target: 'preference_6', time: '14:18:22', conf: 0.72 },
                                { id: 'EV_939', type: 'QUERY', target: 'user_ctx', time: '14:15:01', conf: 0.94 },
                                { id: 'EV_938', type: 'SYNC', target: 'mem_shard_4', time: '14:12:12', conf: 1.00 },
                                { id: 'EV_937', type: 'EXTRACTION', target: 'temporal_marker', time: '14:10:55', conf: 0.88 },
                            ].map((event, i) => (
                                <motion.div 
                                    variants={item}
                                    key={i} 
                                    className="px-5 py-3 flex items-center justify-between hover:bg-[var(--obsidian-hover)] transition-colors group cursor-default"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] text-muted-foreground/30 font-bold">{event.time}</span>
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded-none border border-[var(--obsidian-badge-border)]",
                                            event.type === 'CLASH' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            event.type === 'SYNC' ? "bg-primary/10 text-primary border-primary/20" :
                                            "bg-[var(--obsidian-border)]/5 text-muted-foreground"
                                        )}>
                                            {event.type}
                                        </span>
                                        <span className="text-[11px] text-foreground/70 font-bold tracking-tight">
                                            {event.target} <span className="text-muted-foreground/40 mr-2">/</span> <span className="text-[9px] opacity-40 uppercase font-bold tracking-[0.2em]">{event.id}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:flex items-center gap-2">
                                            <div className="w-16 h-1 bg-[var(--obsidian-border)]/30 rounded-full overflow-hidden">
                                                <motion.div 
                                                  initial={{ width: 0 }}
                                                  animate={{ width: `${event.conf * 100}%` }}
                                                  transition={{ duration: 1, delay: i * 0.1 }}
                                                  className="h-full bg-primary" 
                                                />
                                            </div>
                                            <span className="text-[9px] text-muted-foreground/50 font-bold">{Math.floor(event.conf * 100)}%</span>
                                        </div>
                                        <ChevronRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
          </div>

          {/* Side Systems Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* System Blueprint - Empty State Intelligence intelligence */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="obsidian-card rounded-sm p-8 border-dashed border-[var(--obsidian-border)] relative overflow-hidden group"
            >
                {/* Blueprint Grid Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(var(--obsidian-border)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-20" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <Workflow className="h-4 w-4 text-primary opacity-50" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/80">Contextual_Graph_v2</h3>
                    </div>
                </div>
                
                {/* Visual Blueprint for Graph */}
                <div className="relative h-48 w-full flex items-center justify-center border border-[var(--obsidian-border)] bg-[var(--obsidian-card)]/50">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="h-36 w-36 text-primary/[0.05] animate-[spin_30s_linear_infinite]" />
                    </div>
                    
                    <div className="text-center space-y-4 z-10 px-8">
                        <div className="flex justify-center gap-4 mb-2 opacity-20">
                            <Layers className="h-3 w-3" />
                            <Fingerprint className="h-3 w-3" />
                            <Terminal className="h-3 w-3" />
                        </div>
                        <p className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em]">Awaiting Knowledge Initialization</p>
                        <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-[0.25em] font-medium opacity-40">
                            NEURAL SCHEMATICS INITIALIZE AFTER FIRST 100 NODE INJECTIONS.
                        </p>
                    </div>
                </div>

                <Button variant="ghost" className="w-full mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40 hover:text-primary hover:bg-primary/[0.03] border border-transparent hover:border-primary/20 rounded-none h-10 transition-all">
                    SYSTEM_ACCESS_Lvl_1
                </Button>
            </motion.div>

            {/* Quick Command Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="obsidian-card rounded-sm p-8 bg-primary/[0.01] border-primary/[0.05]"
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">System_Diagnostics</h3>
                    <Lock className="h-3 w-3 text-primary/30" />
                </div>
                <div className="space-y-4">
                    {[
                        { label: 'Vault Integrity', icon: ShieldCheck, status: 'OPTIMAL', color: 'text-green-500' },
                        { label: 'Layer Latency', icon: Zap, status: '12ms', color: 'text-primary' },
                        { label: 'Discovery Mode', icon: Search, status: 'STANDBY', color: 'text-amber-500' },
                    ].map((cmd, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-[var(--obsidian-card)]/50 border border-[var(--obsidian-border)] hover:bg-[var(--obsidian-hover)] hover:border-primary/20 transition-all cursor-pointer group rounded-none">
                            <div className="flex items-center gap-4">
                                <cmd.icon className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all" />
                                <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest group-hover:text-foreground transition-colors">{cmd.label}</span>
                            </div>
                            <span className={cn("text-[9px] font-mono font-bold tracking-widest", cmd.color)}>{cmd.status}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
