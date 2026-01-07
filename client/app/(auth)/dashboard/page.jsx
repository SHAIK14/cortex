"use client"

import * as React from "react"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { useAuthStore } from "@/store/useAuthStore"
import { IconAlertTriangle, IconSettings, IconCircleFilled } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { credentials } = useAuthStore()
  const [mounted, setMounted] = React.useState(false)
  const isConfigured = !!credentials.openai_key && !!credentials.supabase_url

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4 animate-in fade-in duration-500">
      {!isConfigured && (
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between gap-4 p-2 px-4 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 text-xs font-semibold shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Infrastructure Offline — Neural engine requires configuration.</span>
            </div>
            <Button variant="link" size="sm" asChild className="h-auto p-0 text-amber-600 dark:text-amber-500 font-bold hover:no-underline underline-offset-4 hover:underline">
              <Link href="/settings">Configure</Link>
            </Button>
          </div>
        </div>
      )}
      
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      
      <DataTable />
    </div>
  )
}
