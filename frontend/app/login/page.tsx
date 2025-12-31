'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ChevronRight, Lock, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { useAuthStore } from '@/lib/store';
import { NeuralBackground } from '@/components/memories/NeuralBackground';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { useSound } from '@/components/layout/SoundProvider';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const { playSound } = useSound();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playSound('interaction');

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
      playSound('warp');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      playSound('alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--obsidian-bg)] p-4 relative overflow-hidden">
      <NeuralBackground />
      
      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="obsidian-card p-10 bg-[var(--obsidian-bg)]/80 backdrop-blur-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <Link href="/" className="mb-8 group">
              <div className="h-16 w-16 flex items-center justify-center border border-[var(--obsidian-border)] bg-[var(--obsidian-card)] transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <Logo size={40} />
              </div>
            </Link>
            
            <h1 className="text-xl font-bold tracking-[0.3em] text-foreground uppercase mb-2">
                <ScrambleText text="TERMINAL_ACCESS" triggerOn="load" />
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
                System_Key_Required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/5 border border-red-500/20 text-[10px] uppercase font-bold tracking-widest text-red-500 animate-in fade-in slide-in-from-top-1">
                ERROR_&gt; {error}
              </div>
            )}

            <div className="space-y-2.5">
              <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground/60 flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <ScrambleText text="OPERATOR_EMAIL" />
              </Label>
              <Input
                type="email"
                placeholder="id@nexus.cortex"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-[var(--obsidian-card)]/50 border-[var(--obsidian-border)] focus:border-primary/50 text-[11px] font-mono tracking-tight transition-all rounded-none"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground/60 flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    <ScrambleText text="ACCESS_PHRASE" />
                </Label>
                <Link href="#" className="text-[9px] font-bold text-primary/40 hover:text-primary transition-colors uppercase tracking-widest">Forgot_?</Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-[var(--obsidian-card)]/50 border-[var(--obsidian-border)] focus:border-primary/50 text-[11px] font-mono tracking-tight transition-all rounded-none"
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-[0.3em] rounded-none shadow-xl shadow-primary/20 transition-all mt-4" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  AUTHENTICATING...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                    ESTABLISH_LINK <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="pt-6 border-t border-[var(--obsidian-border)] flex flex-col items-center gap-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20">Awaiting_New_Protocol_?</p>
                <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full h-10 border-[var(--obsidian-border)] bg-transparent hover:bg-[var(--obsidian-hover)] text-[9px] font-bold uppercase tracking-[0.3em] rounded-none transition-all">
                        Initialize_New_Identity
                    </Button>
                </Link>
            </div>
          </form>
        </div>
        
        {/* Footer Meta Data */}
        <div className="mt-8 flex items-center justify-between px-2 opacity-20">
            <div className="flex items-center gap-2">
                <Shield className="h-2.5 w-2.5" />
                <span className="text-[8px] font-bold uppercase tracking-widest">AES-256_Enforced</span>
            </div>
            <span className="text-[8px] font-mono font-bold tracking-widest">NODE_ID: 0x94A_LOGIN</span>
        </div>
      </motion.div>
    </div>
  );
}
