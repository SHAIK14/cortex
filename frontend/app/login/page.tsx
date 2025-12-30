'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      setAccessToken(data.access_token);
      setUser({ id: data.user_id || '', email, created_at: new Date().toISOString() });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0,transparent_70%)] -z-10" />

      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <Link href="/" className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 border border-white/5 shadow-inner group">
            <Logo size={40} className="transition-transform group-hover:scale-110" />
          </Link>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your Cortex account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-muted-foreground/70">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background/50 border-border/50 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-muted-foreground/70">Password</Label>
                <Link href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-background/50 border-border/50 focus:ring-primary/20 transition-all"
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Authenticating...
                </>
              ) : (
                <span className="flex items-center gap-2">
                    Sign in <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground tracking-tighter">New to Cortex?</span></div>
            </div>

            <Link href="/signup">
                <Button variant="outline" className="w-full h-11 border-border/50 bg-transparent hover:bg-secondary/50 transition-all font-semibold">
                    Create an account
                </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
