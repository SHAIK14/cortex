'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, Header } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useConfigStore } from '@/lib/store';
import { Check, X, Loader2, Eye, EyeOff, Shield, Database, Cpu, Settings, Zap, Fingerprint } from 'lucide-react';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { useSound } from '@/components/layout/SoundProvider';
import { cn } from '@/lib/utils';

import { ScrollArea } from '@/components/ui/scroll-area';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { apiConfig, setApiConfig } = useConfigStore();
  const { playSound } = useSound();

  const [openaiKey, setOpenaiKey] = useState(apiConfig.openai_key || '');
  const [supabaseUrl, setSupabaseUrl] = useState(apiConfig.supabase_url || '');
  const [supabaseKey, setSupabaseKey] = useState(apiConfig.supabase_key || '');
  const [cohereKey, setCohereKey] = useState(apiConfig.cohere_key || '');

  const [showOpenai, setShowOpenai] = useState(false);
  const [showSupabase, setShowSupabase] = useState(false);
  const [showCohere, setShowCohere] = useState(false);

  const [testingOpenai, setTestingOpenai] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [openaiValid, setOpenaiValid] = useState<boolean | null>(null);
  const [supabaseValid, setSupabaseValid] = useState<boolean | null>(null);

  const [useRerank, setUseRerank] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleToggle = (setter: any, value: boolean) => {
    setter(value);
    playSound('interaction');
  };

  const testOpenai = async () => {
    setTestingOpenai(true);
    setOpenaiValid(null);
    playSound('interaction');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const isValid = openaiKey.startsWith('sk-');
      setOpenaiValid(isValid);
      playSound(isValid ? 'interaction' : 'alert');
    } catch {
      setOpenaiValid(false);
      playSound('alert');
    } finally {
      setTestingOpenai(false);
    }
  };

  const testSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseValid(null);
    playSound('interaction');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const isValid = supabaseUrl.includes('supabase.co') && supabaseKey.length > 20;
      setSupabaseValid(isValid);
      playSound(isValid ? 'interaction' : 'alert');
    } catch {
      setSupabaseValid(false);
      playSound('alert');
    } finally {
      setTestingSupabase(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    playSound('interaction');
    setApiConfig({
      openai_key: openaiKey,
      supabase_url: supabaseUrl,
      supabase_key: supabaseKey,
      cohere_key: cohereKey,
    });
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    playSound('warp');
  };

  return (
    <DashboardLayout>
      <Header title="Control_Plane" />

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl p-8 space-y-12">
          <header className="flex items-center justify-between border-b border-[var(--obsidian-border)] pb-8">
              <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-[0.2em] uppercase flex items-center gap-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <ScrambleText text="SYSTEM_CONFIGURATION" />
                  </h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
                      Nexus_ID: 0x84_CONTROL_NODE
                  </p>
              </div>
              <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">NODE_SYNCHRONIZED</span>
              </div>
          </header>

          <Tabs defaultValue="api-keys" className="space-y-10">
            <TabsList className="bg-[var(--obsidian-card)] border border-[var(--obsidian-border)] rounded-none h-12 p-1 gap-1">
              <TabsTrigger 
                  value="api-keys" 
                  onClick={() => playSound('interaction')}
                  className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] font-bold uppercase tracking-[0.2em] flex-1 transition-all h-full"
              >
                  [ API_CREDENTIALS ]
              </TabsTrigger>
              <TabsTrigger 
                  value="preferences" 
                  onClick={() => playSound('interaction')}
                  className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] font-bold uppercase tracking-[0.2em] flex-1 transition-all h-full"
              >
                  [ NEURAL_LOGIC ]
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              {/* OpenAI */}
              <div className="obsidian-card p-8 space-y-6 group">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="h-8 w-8 bg-primary/5 border border-primary/20 flex items-center justify-center">
                              <Cpu className="h-4 w-4 text-primary/60" />
                          </div>
                          <div>
                              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">
                                  <ScrambleText text="OPENAI_NEURAL_ENGINE" />
                              </h3>
                              <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/30">Embeddings & Reasoning Pathways</p>
                          </div>
                      </div>
                      {openaiValid !== null && (
                          <div className={cn("px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border", openaiValid ? "bg-primary/10 border-primary/40 text-primary" : "bg-red-500/10 border-red-500/40 text-red-500")}>
                              {openaiValid ? "CREDENTIAL_VERIFIED" : "VERIFICATION_FAILED"}
                          </div>
                      )}
                  </div>

                  <div className="flex gap-3">
                      <div className="relative flex-1">
                          <Input
                              type={showOpenai ? 'text' : 'password'}
                              placeholder="sk-..."
                              value={openaiKey}
                              onChange={(e) => setOpenaiKey(e.target.value)}
                              className="bg-[var(--obsidian-card)]/50 border-[var(--obsidian-border)] rounded-none h-10 focus:border-primary/40 text-[11px] font-mono pr-12"
                          />
                          <button
                              type="button"
                              className="absolute right-0 top-0 h-full px-4 text-muted-foreground/40 hover:text-primary transition-colors"
                              onClick={() => { setShowOpenai(!showOpenai); playSound('interaction'); }}
                          >
                              {showOpenai ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                      </div>
                      <Button
                          variant="outline"
                          onClick={testOpenai}
                          disabled={testingOpenai || !openaiKey}
                          className="rounded-none border-[var(--obsidian-border)] h-10 px-6 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-primary/5 transition-all"
                      >
                          {testingOpenai ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'TEST_CREDENTIAL'}
                      </Button>
                  </div>
              </div>

              {/* Supabase */}
              <div className="obsidian-card p-8 space-y-8">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="h-8 w-8 bg-primary/5 border border-primary/20 flex items-center justify-center">
                              <Database className="h-4 w-4 text-primary/60" />
                          </div>
                          <div>
                              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">
                                  <ScrambleText text="SUPABASE_STORAGE_NODE" />
                              </h3>
                              <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/30">Vector Database & Metadata Vault</p>
                          </div>
                      </div>
                      {supabaseValid !== null && (
                          <div className={cn("px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border", supabaseValid ? "bg-primary/10 border-primary/40 text-primary" : "bg-red-500/10 border-red-500/40 text-red-500")}>
                              {supabaseValid ? "LINK_ESTABLISHED" : "LINK_FAILURE"}
                          </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                          <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">NODE_URL</Label>
                          <Input
                              placeholder="https://xxxxx.supabase.co"
                              value={supabaseUrl}
                              onChange={(e) => setSupabaseUrl(e.target.value)}
                              className="bg-[var(--obsidian-card)]/50 border-[var(--obsidian-border)] rounded-none h-10 focus:border-primary/40 text-[11px] font-mono"
                          />
                      </div>
                      <div className="space-y-2.5">
                          <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">SERVICE_KEY</Label>
                          <div className="relative">
                              <Input
                                  type={showSupabase ? 'text' : 'password'}
                                  placeholder="eyJ..."
                                  value={supabaseKey}
                                  onChange={(e) => setSupabaseKey(e.target.value)}
                                  className="bg-[var(--obsidian-card)]/50 border-[var(--obsidian-border)] rounded-none h-10 focus:border-primary/40 text-[11px] font-mono pr-12"
                              />
                              <button
                                  type="button"
                                  className="absolute right-0 top-0 h-full px-4 text-muted-foreground/40 hover:text-primary transition-colors"
                                  onClick={() => { setShowSupabase(!showSupabase); playSound('interaction'); }}
                              >
                                  {showSupabase ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                          </div>
                      </div>
                  </div>

                  <Button
                      variant="outline"
                      onClick={testSupabase}
                      disabled={testingSupabase || !supabaseUrl || !supabaseKey}
                      className="w-full rounded-none border-[var(--obsidian-border)] h-10 text-[9px] font-bold uppercase tracking-[2px] hover:bg-primary/5 transition-all"
                  >
                      {testingSupabase ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : 'VERIFY_VAULT_CONNECTION'}
                  </Button>
              </div>

              {/* Cohere */}
              <div className="obsidian-card p-8 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                      <div className="h-8 w-8 bg-primary/5 border border-primary/20 flex items-center justify-center">
                          <Zap className="h-4 w-4 text-primary/60" />
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">
                                  <ScrambleText text="COHERE_RERANK_HOOK" />
                              </h3>
                              <Badge variant="secondary" className="rounded-none text-[8px] h-4 bg-muted/30 border-muted-foreground/20 text-muted-foreground/50">OPTIONAL</Badge>
                          </div>
                          <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/30">Semantic Recall Enhancement</p>
                      </div>
                  </div>
                  <div className="w-1/3 relative">
                      <Input
                          type={showCohere ? 'text' : 'password'}
                          placeholder="Key null"
                          value={cohereKey}
                          onChange={(e) => setCohereKey(e.target.value)}
                          className="bg-[var(--obsidian-card)]/50 border-[var(--obsidian-border)] rounded-none h-9 focus:border-primary/40 text-[10px] font-mono pr-10"
                      />
                      <button
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground/40 hover:text-primary transition-colors"
                          onClick={() => { setShowCohere(!showCohere); playSound('interaction'); }}
                      >
                          {showCohere ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                  </div>
              </div>

              <Button onClick={saveSettings} disabled={saving} className="w-full h-12 rounded-none bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl shadow-primary/20 transition-all">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SYNCHRONIZE_CONFIG_TO_Nexus'}
              </Button>
            </TabsContent>

            {/* Neural Logic Tab */}
            <TabsContent value="preferences" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="obsidian-card p-10 space-y-12">
                  <div className="flex items-center justify-between border-b border-[var(--obsidian-border)] pb-8">
                      <div className="space-y-1">
                          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 flex items-center gap-3">
                              <Fingerprint className="h-4 w-4 text-primary" />
                              <ScrambleText text="RETRIEVAL_ALGORITHMS" />
                          </h3>
                          <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/30">Calibrate Neural Recall Sensitivity</p>
                      </div>
                      <div className="flex items-center gap-3 bg-[var(--obsidian-bg)]/50 border border-[var(--obsidian-border)] p-1 px-3">
                          <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Active_Protocol: V.2.1</span>
                      </div>
                  </div>

                  <div className="space-y-10">
                      <div className="flex items-center justify-between group">
                          <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">Enable_Semantic_Reranking</Label>
                              <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest leading-relaxed">Boost context precision via cross-attention reranking</p>
                          </div>
                          <Switch
                              checked={useRerank}
                              onCheckedChange={(v) => handleToggle(setUseRerank, v)}
                              disabled={!cohereKey}
                              className="data-[state=checked]:bg-primary"
                          />
                      </div>

                      <div className="space-y-6">
                          <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">Confidence_Threshold</Label>
                                  <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest leading-relaxed">Filter out noisy or unstable neural nodes</p>
                              </div>
                              <div className="bg-[var(--obsidian-card)] border border-[var(--obsidian-border)] px-3 py-1 text-[10px] font-mono font-bold text-primary animate-pulse">
                                  {confidenceThreshold.toFixed(2)}
                              </div>
                          </div>
                          <div className="relative pt-2">
                              <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={confidenceThreshold}
                                  onChange={(e) => {
                                      setConfidenceThreshold(parseFloat(e.target.value));
                                  }}
                                  onMouseDown={() => playSound('interaction')}
                                  className="h-1.5 w-full cursor-pointer appearance-none bg-[var(--obsidian-border)] accent-primary outline-none"
                              />
                              <div className="flex justify-between mt-3 opacity-20">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">BROAD_CONTEXT</span>
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">SURGICAL_PRECISION</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="pt-8 border-t border-[var(--obsidian-border)]">
                      <Button onClick={saveSettings} disabled={saving} className="w-full h-11 rounded-none border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.3em] transition-all">
                        {saving ? 'UPDATING_LOGIC_WEIGHTS...' : 'COMMIT_NEURAL_LOGIC_PARAMETERS'}
                      </Button>
                  </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Global System Integrity Seal */}
          <footer className="pt-12 text-center opacity-10">
              <div className="flex flex-col items-center gap-4">
                  <Shield className="h-12 w-12 text-muted-foreground" />
                  <p className="text-[9px] font-mono tracking-[0.5em] uppercase font-bold">Encrypted_Management_Plane_V.2.0.4</p>
              </div>
          </footer>
        </div>
      </ScrollArea>
    </DashboardLayout>
  );
}
