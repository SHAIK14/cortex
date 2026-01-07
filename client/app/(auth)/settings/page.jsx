'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ExternalLink,
  RefreshCw,
  Terminal,
  Database,
  Cpu,
  Lock,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { credentials, setCredentials } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(credentials);
  const [activeTab, setActiveTab] = useState("intelligence");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Validation states
  const [testing, setTesting] = useState({ openai: false, supabase: false });
  const [status, setStatus] = useState({ openai: null, supabase: null });

  useEffect(() => {
    setMounted(true);
    setForm(credentials);
  }, [credentials]);

  if (!mounted) return null;

  const testOpenAI = async () => {
    if (!form.openai_key) return;
    setTesting(prev => ({ ...prev, openai: true }));
    setStatus(prev => ({ ...prev, openai: null }));
    
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${form.openai_key}` }
      });
      if (res.ok) setStatus(prev => ({ ...prev, openai: 'valid' }));
      else throw new Error('Invalid Key');
    } catch (err) {
      setStatus(prev => ({ ...prev, openai: 'invalid' }));
    } finally {
      setTesting(prev => ({ ...prev, openai: false }));
    }
  };

  const testSupabase = async () => {
    if (!form.supabase_url || !form.supabase_key) return;
    setTesting(prev => ({ ...prev, supabase: true }));
    setStatus(prev => ({ ...prev, supabase: null }));
    
    try {
      const res = await fetch(`${form.supabase_url}/rest/v1/`, {
        headers: { apikey: form.supabase_key, Authorization: `Bearer ${form.supabase_key}` }
      });
      if (res.ok || res.status === 404) setStatus(prev => ({ ...prev, supabase: 'valid' }));
      else throw new Error('Invalid Configuration');
    } catch (err) {
      setStatus(prev => ({ ...prev, supabase: 'invalid' }));
    } finally {
      setTesting(prev => ({ ...prev, supabase: false }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await new Promise(r => setTimeout(r, 800));
    setCredentials(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-zinc-100 dark:border-zinc-900">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Orchestrate your neural infrastructure and persistence layers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 px-3 gap-1.5 font-medium border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <Lock className="w-3.5 h-3.5" />
            Zero-Knowledge Local Persistence
          </Badge>
          <Button 
            onClick={handleSave}
            size="sm"
            className={cn(
              "h-8 px-5 font-bold uppercase tracking-wider text-[10px] transition-all",
              saved && "bg-green-600 hover:bg-green-700"
            )}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : saved ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Saved</span>
            ) : (
              <span className="flex items-center gap-1.5"><Save className="w-3 h-3" /> Save Changes</span>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="intelligence" className="space-y-8" onValueChange={setActiveTab}>
        <div className="bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-lg inline-flex border border-zinc-200 dark:border-zinc-800">
          <TabsList className="bg-transparent h-9 border-0 p-0">
            <SettingsTab value="intelligence" label="Intelligence" icon={<Cpu className="w-3.5 h-3.5" />} />
            <SettingsTab value="persistence" label="Persistence" icon={<Database className="w-3.5 h-3.5" />} />
            <SettingsTab value="advanced" label="Advanced" icon={<Terminal className="w-3.5 h-3.5" />} />
          </TabsList>
        </div>

        <TabsContent value="intelligence" className="animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Reasoning Core</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Configuring OpenAI enables memory extraction, categorization, and neural chat completions.</p>
            </div>
            <div className="md:col-span-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai_key" className="text-xs font-bold uppercase tracking-tighter">OpenAI API Key</Label>
                  <ValidationBadge status={status.openai} loading={testing.openai} onTest={testOpenAI} />
                </div>
                <div className="relative group">
                  <Input
                    id="openai_key"
                    type="password"
                    placeholder="sk-..."
                    className="h-10 border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-400 bg-white dark:bg-zinc-950 font-mono text-xs"
                    value={form.openai_key}
                    onChange={(e) => setForm({ ...form, openai_key: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 italic">
                  <ShieldCheck className="w-3 h-3" />
                  Key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="persistence" className="animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Vector Storage</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Supabase acts as your personal memory vault. Requires pgvector for semantic search.</p>
            </div>
            <div className="md:col-span-8 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabase_url" className="text-xs font-bold uppercase tracking-tighter">Supabase Project URL</Label>
                  <Input
                    id="supabase_url"
                    placeholder="https://xyz.supabase.co"
                    className="h-10 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                    value={form.supabase_url}
                    onChange={(e) => setForm({ ...form, supabase_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="supabase_key" className="text-xs font-bold uppercase tracking-tighter">Service Role Key</Label>
                    <ValidationBadge status={status.supabase} loading={testing.supabase} onTest={testSupabase} />
                  </div>
                  <Input
                    id="supabase_key"
                    type="password"
                    placeholder="eyJhb..."
                    className="h-10 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono text-xs"
                    value={form.supabase_key}
                    onChange={(e) => setForm({ ...form, supabase_key: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                <div className="p-2 rounded bg-amber-500/10 text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold">Extension Required</p>
                  <p className="text-[10px] text-zinc-500 leading-normal">Ensure <code className="text-amber-600 dark:text-amber-500 font-bold bg-amber-500/5 px-1 rounded">pgvector</code> is enabled in your Supabase project settings for context hits to function.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Future Rerankers</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">High-precision search enhancements and alternative neural providers.</p>
            </div>
            <div className="md:col-span-8 space-y-6 opacity-60 grayscale cursor-not-allowed">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-tighter">Cohere API Key (Coming Soon)</Label>
                <Input disabled placeholder="Disabled in preview" className="h-10 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-tighter">Anthropic Support (Planned)</Label>
                <Input disabled placeholder="Disabled in preview" className="h-10 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsTab({ value, label, icon }) {
  return (
    <TabsTrigger 
      value={value} 
      className="gap-2 px-4 py-1.5 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm data-[state=active]:text-black dark:data-[state=active]:text-white rounded-md transition-all uppercase tracking-widest text-zinc-500"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}

function ValidationBadge({ status, loading, onTest }) {
  if (loading) return <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />;
  
  if (status === 'valid') return (
    <div className="bg-green-500/10 text-green-600 dark:text-green-500 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter">
      <CheckCircle2 className="w-2.5 h-2.5" />
      Online
    </div>
  );
  
  if (status === 'invalid') return (
    <div className="bg-red-500/10 text-red-600 dark:text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter">
      <AlertCircle className="w-2.5 h-2.5" />
      Error
    </div>
  );

  return (
    <button 
      type="button"
      onClick={onTest}
      className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-[9px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1"
    >
      <RefreshCw className="w-2.5 h-2.5" />
      Verify Key
    </button>
  );
}
