"use client"

import { 
  IconDatabase, 
  IconActivity, 
  IconUser, 
  IconBrain 
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { useState, useEffect } from "react"
import api from "@/lib/api"

export function SectionCards() {
  const { credentials } = useAuthStore()
  const [stats, setStats] = useState({ total_memories: 0, by_type: {} })

  useEffect(() => {
    async function fetchStats() {
      if (!credentials.supabase_url) return
      try {
        const response = await api.post('/memory/stats', { credentials })
        setStats(response.data)
      } catch (err) {
        console.error('Stats fetch failed', err)
      }
    }
    fetchStats()
  }, [credentials])

  const kpis = [
    {
      title: "Active Cortex",
      value: stats.total_memories,
      description: "Total persistent facts",
      icon: IconDatabase,
      color: "text-amber-500",
    },
    {
      title: "Context State",
      value: credentials.supabase_url ? "Optimal" : "Disconnected",
      description: credentials.supabase_url ? "Retrieval is healthy" : "Requires DB connection",
      icon: IconActivity,
      color: credentials.supabase_url ? "text-green-500" : "text-destructive",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="relative overflow-hidden group shadow-2xl border-muted/30 hover:border-amber-500/30 transition-all duration-500 dark:bg-zinc-950/50 backdrop-blur-xl">
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 group-hover:text-amber-500/70 transition-colors">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-muted/50 group-hover:border-amber-500/30 transition-all`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color} opacity-90`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black tracking-tighter flex items-baseline gap-2">
              {kpi.value}
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Units</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-2 font-bold uppercase tracking-tight">
              {kpi.description}
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      ))}
    </div>
  )
}
