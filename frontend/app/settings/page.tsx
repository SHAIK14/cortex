'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, Header } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useConfigStore } from '@/lib/store';
import { Check, X, Loader2, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { apiConfig, setApiConfig } = useConfigStore();

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

  if (!isAuthenticated) {
    return null;
  }

  const testOpenai = async () => {
    setTestingOpenai(true);
    setOpenaiValid(null);

    try {
      // Mock test - in production, call backend to validate
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOpenaiValid(openaiKey.startsWith('sk-'));
    } catch {
      setOpenaiValid(false);
    } finally {
      setTestingOpenai(false);
    }
  };

  const testSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseValid(null);

    try {
      // Mock test
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSupabaseValid(supabaseUrl.includes('supabase.co') && supabaseKey.length > 20);
    } catch {
      setSupabaseValid(false);
    } finally {
      setTestingSupabase(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);

    setApiConfig({
      openai_key: openaiKey,
      supabase_url: supabaseUrl,
      supabase_key: supabaseKey,
      cohere_key: cohereKey,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  return (
    <DashboardLayout>
      <Header title="Settings" />

      <div className="mx-auto max-w-3xl p-6">
        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            {/* OpenAI */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>OpenAI API Key</CardTitle>
                    <CardDescription>
                      Used for embeddings and LLM calls
                    </CardDescription>
                  </div>
                  {openaiValid !== null && (
                    <Badge variant={openaiValid ? 'default' : 'destructive'}>
                      {openaiValid ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Valid
                        </>
                      ) : (
                        <>
                          <X className="mr-1 h-3 w-3" /> Invalid
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showOpenai ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="bg-background pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowOpenai(!showOpenai)}
                    >
                      {showOpenai ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={testOpenai}
                    disabled={testingOpenai || !openaiKey}
                  >
                    {testingOpenai ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Test'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Supabase */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Supabase Configuration</CardTitle>
                    <CardDescription>
                      Vector database for memory storage
                    </CardDescription>
                  </div>
                  {supabaseValid !== null && (
                    <Badge variant={supabaseValid ? 'default' : 'destructive'}>
                      {supabaseValid ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Connected
                        </>
                      ) : (
                        <>
                          <X className="mr-1 h-3 w-3" /> Failed
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Supabase URL</Label>
                  <Input
                    type="text"
                    placeholder="https://xxxxx.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Supabase Service Key</Label>
                  <div className="relative">
                    <Input
                      type={showSupabase ? 'text' : 'password'}
                      placeholder="eyJ..."
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      className="bg-background pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSupabase(!showSupabase)}
                    >
                      {showSupabase ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={testSupabase}
                  disabled={testingSupabase || !supabaseUrl || !supabaseKey}
                >
                  {testingSupabase ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Cohere (Optional) */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>
                  Cohere API Key{' '}
                  <Badge variant="secondary" className="ml-2">
                    Optional
                  </Badge>
                </CardTitle>
                <CardDescription>
                  For improved memory reranking (recommended)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    type={showCohere ? 'text' : 'password'}
                    placeholder="Not configured"
                    value={cohereKey}
                    onChange={(e) => setCohereKey(e.target.value)}
                    className="bg-background pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCohere(!showCohere)}
                  >
                    {showCohere ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save API Keys'
              )}
            </Button>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Memory Settings</CardTitle>
                <CardDescription>
                  Configure how memories are processed and retrieved
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Reranking</Label>
                    <p className="text-sm text-muted-foreground">
                      Use Cohere to improve memory relevance
                    </p>
                  </div>
                  <Switch
                    checked={useRerank}
                    onCheckedChange={setUseRerank}
                    disabled={!cohereKey}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Confidence Threshold</Label>
                    <span className="text-sm text-muted-foreground">
                      {confidenceThreshold.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={confidenceThreshold}
                    onChange={(e) =>
                      setConfidenceThreshold(parseFloat(e.target.value))
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Memories below this threshold will be filtered out
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
