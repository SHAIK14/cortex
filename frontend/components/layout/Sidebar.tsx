'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Database,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Terminal,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore, useAuthStore } from '@/lib/store';
import { Logo } from '@/components/ui/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Playground', href: '/playground', icon: Terminal },
  { name: 'Knowledge', href: '/memories', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout, user } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-[var(--obsidian-border)] bg-[var(--obsidian-bg)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[4px_0_24px_rgba(0,0,0,0.1)]',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Branding Area */}
        <div className="flex h-16 items-center border-b border-[var(--obsidian-border)] px-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <Logo size={24} className="group-hover:scale-110 transition-transform duration-300" />
            {sidebarOpen && (
              <span className="text-sm font-bold tracking-[0.2em] text-foreground uppercase pt-0.5">Cortex</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <TooltipProvider key={item.name} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 group relative',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-[var(--obsidian-hover)] hover:text-foreground'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'group-hover:text-primary transition-colors')} />
                      {sidebarOpen && <span>{item.name}</span>}
                      {isActive && !sidebarOpen && (
                        <div className="absolute right-0 h-4 w-0.5 bg-primary rounded-l-full" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  {!sidebarOpen && (
                    <TooltipContent side="right" className="bg-[var(--obsidian-card)] border-[var(--obsidian-border)] text-foreground text-[10px] uppercase tracking-widest font-bold shadow-2xl">
                       {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>

        {/* User / Footer Area */}
        <div className="border-t border-[var(--obsidian-border)] p-3 space-y-2">
            {sidebarOpen && user && (
                <div className="px-3 py-2 mb-2 rounded-lg bg-[var(--obsidian-card)] border border-[var(--obsidian-border)]">
                    <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <UserIcon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-bold text-foreground">{user.email.split('@')[0]}</p>
                            <p className="truncate text-[9px] font-medium text-muted-foreground uppercase opacity-60">Pro Operator</p>
                        </div>
                    </div>
                </div>
            )}
          
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-destructive/10 hover:text-destructive group transition-all',
              !sidebarOpen && 'px-0 justify-center'
            )}
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>Exit System</span>}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center hover:bg-[var(--obsidian-hover)]"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
