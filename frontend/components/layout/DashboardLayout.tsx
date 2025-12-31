'use client';

import { useUIStore } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      <Sidebar />
      <main
        className={cn(
          'h-full transition-all duration-300 flex flex-col overflow-hidden',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        {children}
      </main>
    </div>
  );
}
