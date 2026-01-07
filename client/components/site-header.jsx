"use client"

import * as React from "react"
import { IconFingerprint } from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/store/useAuthStore"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, BadgeCheck, CreditCard, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function SiteHeader() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const userData = {
    name: user?.email?.split('@')[0] || "User",
    email: user?.email || "user@cortex.ai",
    avatar: "",
  }

  if (!mounted) {
    return (
      <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
              <IconFingerprint className="size-4.5 text-zinc-100 dark:text-zinc-900" />
            </div>
            <span className="font-bold tracking-tight text-sm uppercase">Cortex</span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 group-hover:scale-105 transition-transform">
            <IconFingerprint className="size-4.5 text-zinc-100 dark:text-zinc-900" />
          </div>
          <span className="font-bold tracking-tight text-sm uppercase">Cortex</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center outline-none">
              <Avatar className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="text-[10px] font-bold uppercase">{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2">
                <BadgeCheck className="h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 dark:text-red-400">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
