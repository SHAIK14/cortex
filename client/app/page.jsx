'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconFingerprint, IconArrowRight, IconBrandGithub, IconSparkles, IconDatabase, IconShield } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-muted bg-background/80 backdrop-blur-sm z-50 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFingerprint className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight uppercase">Cortex</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
          >
            Your AI companion deserves <br />
            <span className="text-primary italic">long-term memory.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            Cortex is a specialized memory engine that gives LLMs persistent context. 
            Bring your own keys, own your data, and build smarter agents.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/signup">
                Start Building Now
                <IconArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base border-muted">
              <Link href="https://github.com/shaikasif/Cortex" target="_blank">
                <IconBrandGithub className="mr-2 w-4 h-4" />
                View on GitHub
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust/Infrastructure Section */}
      <section className="py-20 border-t border-muted bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconShield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">100% Data Ownership</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your personal Supabase instance. Your memories never touch our servers.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconDatabase className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Vector Persistence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Persistent long-term memory that scales. Uses pgvector for high-performance retrieval.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconSparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Cross-Model Context</h3>
              <p className="text-muted-foreground leading-relaxed">
                Works with any LLM. Extract context from GPT and use it in Claude or Llama seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-muted">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold opacity-60">
            <IconFingerprint className="w-5 h-5" />
            <span className="uppercase tracking-widest text-xs">Cortex AI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cortex Project. Open source and privacy-focused.
          </div>
        </div>
      </footer>
    </div>
  );
}
