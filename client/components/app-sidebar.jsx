"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFingerprint,
  IconHelp,
  IconMessages,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/useAuthStore"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
    },
    {
      title: "Playground",
      url: "/playground",
    },
    {
      title: "Memories",
      url: "/memories",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Search",
      url: "#",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }) {
  const user = useAuthStore((state) => state.user)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  
  const userData = {
    name: user?.email?.split('@')[0] || "User",
    email: user?.email || "user@cortex.ai",
    avatar: "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props} className="border-r-0 bg-white dark:bg-zinc-950">
      <SidebarContent className="pt-4">
        <NavMain items={data.navMain} />
        <div className="mt-auto px-2 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                <a href="/settings" className="flex items-center gap-3">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <IconSettings className="size-4 text-zinc-500" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold">Settings</span>
                    <span className="truncate text-[10px] text-zinc-400 font-medium">Configure Engine</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
