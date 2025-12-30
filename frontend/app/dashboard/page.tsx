'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout, Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Database, DollarSign, Activity } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface Stats {
  total_chats: number;
  total_memories: number;
  total_cost: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Mock stats for now - will be replaced with API call
    setTimeout(() => {
      setStats({
        total_chats: 24,
        total_memories: 156,
        total_cost: 0.12,
      });
      setLoading(false);
    }, 500);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Chats',
      value: stats?.total_chats ?? 0,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Memories Stored',
      value: stats?.total_memories ?? 0,
      icon: Database,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Cost',
      value: `$${(stats?.total_cost ?? 0).toFixed(4)}`,
      icon: DollarSign,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <DashboardLayout>
      <Header title="Dashboard" />

      <div className="p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your Cortex usage
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className="cursor-pointer border-border bg-card transition-colors hover:border-primary/50"
              onClick={() => router.push('/playground')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Open Playground</p>
                  <p className="text-sm text-muted-foreground">
                    Test memory extraction in chat
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-border bg-card transition-colors hover:border-primary/50"
              onClick={() => router.push('/memories')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Database className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Browse Memories</p>
                  <p className="text-sm text-muted-foreground">
                    View and manage stored memories
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-border bg-card transition-colors hover:border-primary/50"
              onClick={() => router.push('/settings')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <Activity className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Configure API Keys</p>
                  <p className="text-sm text-muted-foreground">
                    Set up your OpenAI and Supabase keys
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h3>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No recent activity. Start a conversation in the Playground to see memory
                  extraction in action.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
