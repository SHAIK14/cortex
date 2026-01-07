'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Calendar, Tag, ExternalLink, Loader2, Database, AlertCircle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function MemoriesPage() {
  const { credentials } = useAuthStore();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchMemories = async () => {
    if (!credentials.supabase_url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/memory/list', { credentials });
      setMemories(response.data.memories);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchMemories();
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await api.post('/memory/search', { 
        credentials, 
        query: searchQuery,
        limit: 20
      });
      setMemories(response.data.memories);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    
    try {
      await api.post(`/memory/${id}/delete`, { credentials });
      setMemories(memories.filter(m => m.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [credentials]);

  const hasCredentials = !!credentials.openai_key && !!credentials.supabase_url;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Memory Explorer</h1>
          <p className="text-muted-foreground text-lg">Search and manage facts across your vector database.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/50" />
            <Input 
              placeholder="Filter memories by keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-muted focus:ring-primary"
            />
          </div>
          <Button type="submit" disabled={isSearching} className="h-10 px-6 font-bold">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </Button>
        </form>
      </header>

      {!hasCredentials ? (
        <Card className="border-muted bg-muted/20">
          <CardContent className="p-12 text-center space-y-4">
             <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
             <h3 className="text-xl font-bold">Disconnected</h3>
             <p className="text-muted-foreground max-w-md mx-auto">
               You must configure your infrastructure in Settings to explore your database.
             </p>
             <Button asChild variant="outline" className="mt-4">
               <a href="/settings">Configure Settings</a>
             </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Database className="w-12 h-12 text-primary/20 mb-4" />
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Syncing vector pool...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="p-20 text-center border border-dashed border-muted rounded-2xl bg-muted/5">
           <Database className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-muted-foreground mb-1">No matches found</h3>
           <p className="text-sm text-muted-foreground/60 mb-6">
             {searchQuery ? `Your query returned zero results from the current index.` : "Your long-term memory is currently empty."}
           </p>
           {!searchQuery && (
             <Button asChild>
               <a href="/playground">Launch Playground</a>
             </Button>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {memories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card className="border-muted hover:border-primary/50 transition-all group h-full shadow-sm hover:shadow-md flex flex-col">
                  <CardContent className="p-6 flex flex-col h-full space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase tracking-tight",
                          getTypeStyles(memory.type)
                        )}>
                          {memory.type}
                        </span>
                        {memory.category && (
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {memory.category}
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(memory.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <blockquote className="text-lg text-foreground font-bold leading-tight grow italic">
                      "{memory.text}"
                    </blockquote>
                    
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/50 border-t border-muted pt-4 space-x-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span>{(memory.confidence * 100).toFixed(0)}% TRUST</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(memory.created_at).toLocaleDateString().toUpperCase()}</span>
                        </div>
                      </div>
                      <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function getTypeStyles(type) {
  switch (type?.toLowerCase()) {
    case 'identity': return 'bg-primary/10 text-primary border border-primary/20';
    case 'preference': return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20';
    case 'fact': return 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20';
    case 'event': return 'bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20';
    default: return 'bg-muted text-muted-foreground border border-muted';
  }
}
