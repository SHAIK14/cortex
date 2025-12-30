import Link from 'next/link';
import { Brain, Database, Zap, GitBranch, ArrowRight, Github, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Cortex</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="https://github.com/your-repo/cortex"
              target="_blank"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Open Source Memory Layer for LLMs
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Give your AI{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              long-term memory
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Cortex automatically extracts, stores, and retrieves relevant context from
            conversations. Your AI remembers users, preferences, and facts across sessions.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/playground">
              <Button variant="outline" size="lg" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Try Playground
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
              <h3 className="mb-4 text-xl font-semibold text-red-400">The Problem</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400">✗</span>
                  LLMs have no persistent memory across sessions
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400">✗</span>
                  Users repeat themselves every conversation
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400">✗</span>
                  Building memory from scratch is complex
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-red-400">✗</span>
                  Existing solutions are closed-source or expensive
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8">
              <h3 className="mb-4 text-xl font-semibold text-green-400">The Solution</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-400">✓</span>
                  Automatic fact extraction from conversations
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-400">✓</span>
                  Intelligent conflict detection and resolution
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-400">✓</span>
                  Semantic + keyword hybrid search
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-400">✓</span>
                  100% open source, self-hostable
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            How Cortex Works
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MessageSquare,
                title: 'Extract',
                description: 'LLM extracts facts, preferences, and identity from conversations',
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
              },
              {
                icon: GitBranch,
                title: 'Compare',
                description: 'Find similar memories and detect conflicts or contradictions',
                color: 'text-purple-500',
                bg: 'bg-purple-500/10',
              },
              {
                icon: Database,
                title: 'Store',
                description: 'Vector + metadata storage with full history tracking',
                color: 'text-green-500',
                bg: 'bg-green-500/10',
              },
              {
                icon: Zap,
                title: 'Retrieve',
                description: 'Hybrid search with reranking for relevant context',
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
                <div className={`mb-4 inline-flex rounded-lg p-3 ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Banner */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-12">
            <Github className="mx-auto mb-6 h-12 w-12 text-foreground" />
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              100% Open Source
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Cortex is fully open source. Self-host it, modify it, or contribute to it.
              Your data stays yours.
            </p>
            <Link
              href="https://github.com/your-repo/cortex"
              target="_blank"
            >
              <Button variant="outline" size="lg" className="gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold">Cortex</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Open source memory layer for LLMs
            </p>
            <div className="flex gap-6">
              <Link
                href="https://github.com/your-repo/cortex"
                target="_blank"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
