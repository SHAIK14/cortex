'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  Settings, 
  Activity, 
  Trash2, 
  Download, 
  Moon, 
  Sun,
  LayoutDashboard,
  Terminal as TerminalIcon,
  Database,
  Command as CommandIcon,
  X,
  LogOut
} from 'lucide-react';
import { useUIStore, useChatStore, useAuthStore } from '@/lib/store';
import { useSound } from '@/components/layout/SoundProvider';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const { theme, setTheme, toggleDebugPanel } = useUIStore();
  const { clearChat } = useChatStore();
  const { logout } = useAuthStore();
  const { playSound } = useSound();

  const handleNav = (url: string) => {
    playSound('warp');
    setOpen(false);
    setTimeout(() => {
        window.location.href = url;
    }, 100);
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-[640px] pointer-events-auto"
          >
            <Command className="relative overflow-hidden rounded-none border border-[var(--obsidian-border)] bg-[var(--obsidian-bg)]/90 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] focus:outline-none">
              <div className="flex items-center border-b border-[var(--obsidian-border)] px-4">
                <Search className="mr-3 h-4 w-4 shrink-0 text-primary opacity-50" />
                <Command.Input
                  placeholder="EXECUTE_COMMAND_> "
                  className="flex h-12 w-full bg-transparent py-3 text-[13px] font-mono outline-none placeholder:text-muted-foreground/30 text-foreground"
                />
                <div className="flex items-center gap-1.5 opacity-20 ml-2">
                    <span className="text-[9px] font-bold border border-current px-1 rounded-sm">ESC</span>
                </div>
              </div>

              <Command.List className="max-h-[360px] overflow-y-auto overflow-x-hidden p-2 scrollbar-none">
                <Command.Empty className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <X className="h-5 w-5 text-muted-foreground/20" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Query_Null_Response</p>
                    </div>
                </Command.Empty>

                <Command.Group heading={<span className="px-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--obsidian-stat-label)] mb-2 block">System_Operations</span>}>
                  <CommandItem onSelect={() => { toggleDebugPanel(); setOpen(false); }}>
                    <Activity className="mr-3 h-3.5 w-3.5 text-primary" />
                    <span>Toggle Intelligence Trace</span>
                    <CommandShortcut>⌘I</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setOpen(false); }}>
                    {theme === 'dark' ? <Sun className="mr-3 h-3.5 w-3.5" /> : <Moon className="mr-3 h-3.5 w-3.5" />}
                    <span>Switch Environment Tone</span>
                    <CommandShortcut>⌘T</CommandShortcut>
                  </CommandItem>
                </Command.Group>

                <Command.Separator className="my-2 h-px bg-[var(--obsidian-border)] mx-2 opacity-50" />

                <Command.Group heading={<span className="px-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--obsidian-stat-label)] mb-2 block">Navigation</span>}>
                  <CommandItem onSelect={() => handleNav('/dashboard')}>
                    <LayoutDashboard className="mr-3 h-3.5 w-3.5" />
                    <span>Dashboard_Feed</span>
                  </CommandItem>
                  <CommandItem onSelect={() => handleNav('/playground')}>
                    <TerminalIcon className="mr-3 h-3.5 w-3.5" />
                    <span>Neural_Terminal</span>
                  </CommandItem>
                  <CommandItem onSelect={() => handleNav('/memories')}>
                    <Database className="mr-3 h-3.5 w-3.5" />
                    <span>Neural_Vault_Archives</span>
                  </CommandItem>
                </Command.Group>

                <Command.Separator className="my-2 h-px bg-[var(--obsidian-border)] mx-2 opacity-50" />

                <Command.Group heading={<span className="px-2 text-[9px] font-bold uppercase tracking-[0.3em] text-destructive/40 mb-2 block text-destructive">Destructive_Ops</span>}>
                  <CommandItem onSelect={() => { clearChat(); setOpen(false); }} className="text-destructive hover:bg-destructive/5">
                    <Trash2 className="mr-3 h-3.5 w-3.5" />
                    <span>Purge_Neural_Session</span>
                  </CommandItem>
                  <CommandItem onSelect={() => { playSound('warp'); logout(); window.location.href = '/'; }} className="text-red-500 hover:bg-red-500/5">
                    <LogOut className="mr-3 h-3.5 w-3.5" />
                    <span>Terminate_Protocol</span>
                  </CommandItem>
                </Command.Group>
              </Command.List>

              {/* Decorative Scanning Line for Command Palette */}
              <div className="absolute inset-0 pointer-events-none border border-primary/20 opacity-0 group-hover:opacity-100" />
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CommandItem({ children, onSelect, className }: { children: React.ReactNode, onSelect?: () => void, className?: string }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-none px-3 py-2.5 text-[11px] font-mono outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-all duration-200 group",
        className
      )}
    >
      {children}
      <div className="absolute left-0 top-0 h-full w-0.5 bg-primary scale-y-0 group-aria-selected:scale-y-100 transition-transform origin-top" />
    </Command.Item>
  );
}

function CommandShortcut({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-auto text-[9px] font-bold tracking-widest text-muted-foreground/30 uppercase">
      {children}
    </span>
  );
}
