'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Database, 
  Brain, 
  Zap, 
  ChevronRight,
  GitBranch,
  Layers,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DebugInfo } from '@/types';

interface IntelligenceGraphProps {
  debugInfo?: DebugInfo;
}

export function IntelligenceGraph({ debugInfo }: IntelligenceGraphProps) {
  const nodes = useMemo(() => [
    { id: 'input', label: 'USER_INPUT', icon: Terminal, x: 50, y: 150 },
    { id: 'recall', label: 'CONTEXT_RECALL', icon: Database, x: 250, y: 150, active: debugInfo && debugInfo.retrieved_memories.length > 0 },
    { id: 'intel', label: 'CORTEX_INTEL', icon: Brain, x: 450, y: 150, active: !!debugInfo },
    { id: 'storage', label: 'NEURAL_VAULT', icon: Layers, x: 650, y: 150, active: debugInfo && debugInfo.extracted_facts.length > 0 },
  ], [debugInfo]);

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-[var(--obsidian-bg)] overflow-hidden relative">
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]" />

      <svg viewBox="0 0 700 300" className="w-full h-auto max-h-full relative z-10 overflow-visible">
        {/* Connection Paths */}
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {nodes.slice(0, -1).map((node, i) => {
          const nextNode = nodes[i + 1];
          const isActive = nextNode.active;
          return (
            <g key={`path-${i}`}>
              <line
                x1={node.x}
                y1={node.y}
                x2={nextNode.x}
                y2={nextNode.y}
                stroke="var(--obsidian-border)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {isActive && (
                <motion.line
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke="var(--primary)"
                  strokeWidth="2"
                  initial={{ strokeDashoffset: 1000, strokeDasharray: 10 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="opacity-40"
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const Icon = node.icon;
          const isActive = node.active || node.id === 'input';
          
          return (
            <g key={node.id} className="group cursor-default">
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="30"
                className={cn(
                  "fill-[var(--obsidian-card)] stroke-[var(--obsidian-border)]",
                  isActive && "stroke-primary/30"
                )}
                whileHover={{ r: 35, strokeWidth: 2 }}
              />
              <foreignObject x={node.x - 15} y={node.y - 15} width="30" height="30" className="pointer-events-none">
                <div className="flex items-center justify-center h-full w-full">
                  <Icon className={cn(
                    "h-4 w-4 transition-colors duration-500",
                    isActive ? "text-primary" : "text-muted-foreground/20"
                  )} />
                </div>
              </foreignObject>
              
              <text
                x={node.x}
                y={node.y + 50}
                textAnchor="middle"
                className={cn(
                  "text-[8px] font-bold uppercase tracking-[0.2em] transition-colors duration-500",
                  isActive ? "fill-foreground" : "fill-muted-foreground/20"
                )}
              >
                {node.label}
              </text>

              {isActive && node.id !== 'input' && (
                <motion.circle
                   cx={node.x}
                   cy={node.y}
                   r="30"
                   fill="none"
                   stroke="var(--primary)"
                   strokeWidth="1"
                   initial={{ scale: 1, opacity: 0.5 }}
                   animate={{ scale: 1.5, opacity: 0 }}
                   transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Intelligence Meta Data Overlay */}
      <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-[var(--obsidian-card)]/50 border border-[var(--obsidian-border)] rounded-sm backdrop-blur-md">
             <div className="flex items-center gap-2 mb-1.5 opacity-40">
                <Zap className="h-2.5 w-2.5 text-primary" />
                <span className="text-[8px] font-bold uppercase tracking-widest">TRACE_INTEGRITY</span>
             </div>
             <p className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-tighter">OPTIMAL_LINK_0.984</p>
          </div>
          <div className="p-3 bg-[var(--obsidian-card)]/50 border border-[var(--obsidian-border)] rounded-sm backdrop-blur-md">
             <div className="flex items-center gap-2 mb-1.5 opacity-40">
                <GitBranch className="h-2.5 w-2.5 text-primary" />
                <span className="text-[8px] font-bold uppercase tracking-widest">NEURAL_DENSITY</span>
             </div>
             <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-tighter">
                {debugInfo ? debugInfo.extracted_facts.length + debugInfo.retrieved_memories.length : 0}X_WEIGHTS
             </p>
          </div>
      </div>
    </div>
  );
}
