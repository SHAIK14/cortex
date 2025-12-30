'use client';

import { useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Bug, Moon, Sun, Activity, Command } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showDebugToggle?: boolean;
}

export function Header({ title, showDebugToggle = false }: HeaderProps) {
  const { debugPanelOpen, toggleDebugPanel, theme, setTheme } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--obsidian-border)] bg-[var(--obsidian-header)] px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {/* Discrete Breadcrumb Style */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="text-muted-foreground/80">Systems</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Status Indicators */}
        <div className="hidden md:flex items-center gap-4 mr-4 border-r border-[var(--obsidian-border)] pr-6">
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Core Active</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Synced</span>
            </div>
        </div>

        {showDebugToggle && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={debugPanelOpen ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={toggleDebugPanel}
                  className={cn(
                    "h-8 w-8 rounded-md transition-all border border-transparent",
                    debugPanelOpen ? "bg-primary/10 border-primary/20" : "hover:bg-primary/5"
                  )}
                >
                  <Activity className={cn("h-3.5 w-3.5 transition-colors", debugPanelOpen ? "text-primary" : "text-muted-foreground")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[var(--obsidian-card)] border-[var(--obsidian-border)] text-foreground text-[10px] uppercase tracking-widest font-bold shadow-2xl">
                {debugPanelOpen ? 'Close' : 'Inspect'} Intelligence Trace
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-md hover:bg-primary/5 border border-transparent hover:border-border/50 transition-all"
              >
                {theme === 'dark' ? (
                  <Sun className="h-3.5 w-3.5 text-primary/80" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-primary/80" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[var(--obsidian-card)] border-[var(--obsidian-border)] text-foreground text-[10px] uppercase tracking-widest font-bold shadow-2xl">
              Cycle Environment Tone
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
