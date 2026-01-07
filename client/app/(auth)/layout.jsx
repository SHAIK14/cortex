"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <SiteHeader />
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider
          style={{
            "--sidebar-width": "16rem",
          }}
        >
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/30">
            {children}
          </main>
        </SidebarProvider>
      </div>
    </div>
  )
}
