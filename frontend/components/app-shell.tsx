"use client";

import { AuthGate } from "@/components/auth-gate";
import { CortexMark } from "@/components/cortex-mark";
import { SessionUserProvider } from "@/components/session-user";
import { supabase } from "@/lib/supabase";
import { LogOut, Menu, MessageSquare, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/memories", label: "Memories", icon: Search },
];

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/memories")) return "Memories";
  if (pathname.startsWith("/chat")) return "Chat";
  return "Cortex";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function renderNav() {
    return (
      <nav className="flex flex-col gap-px px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileNavOpen(false)}
              data-active={isActive}
              className="cortex-rail-row"
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <AuthGate>
      {(session) => (
        <SessionUserProvider
          user={{
            id: session.user.id,
            email: session.user.email ?? "user",
            accessToken: session.access_token,
          }}
        >
          <main className="cortex-shell flex w-full gap-3 p-3 md:gap-4 md:p-4">
            <aside className="cortex-rail sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col rounded-[14px] md:flex">
              <div className="flex items-center gap-2 px-4 pt-4 pb-3">
                <CortexMark size={28} />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink">Cortex</p>
                  <p className="truncate text-[11.5px] text-ink-3">Memory layer</p>
                </div>
              </div>

              <div className="mt-1 flex-1 overflow-y-auto">{renderNav()}</div>

              <div className="mx-2 mb-3 mt-auto rounded-[10px] bg-inset p-3 shadow-hairline">
                <p className="truncate text-[11px] text-ink-3">Signed in as</p>
                <p className="truncate text-[12.5px] font-medium text-ink">
                  {session.user.email}
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] bg-hover-2 text-[12.5px] font-medium text-ink transition hover:bg-line-strong active:scale-[0.98]"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </aside>

            <section className="cortex-main">
              <header className="cortex-panel flex items-center justify-between px-4 py-3 md:px-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(true)}
                    className="inline-flex size-8 items-center justify-center rounded-[8px] text-ink-2 transition hover:bg-hover-2 hover:text-ink md:hidden"
                    aria-label="Open navigation menu"
                  >
                    <Menu size={18} />
                  </button>
                  <h1 className="text-[15px] font-semibold text-ink md:text-[16px]">
                    {pageTitle}
                  </h1>
                </div>
                <p className="hidden text-[12.5px] text-ink-3 sm:block">
                  {session.user.email}
                </p>
              </header>

              <div className="min-h-0 flex-1">{children}</div>
            </section>

            {isMobileNavOpen ? (
              <div className="fixed inset-0 z-50 md:hidden">
                <button
                  type="button"
                  className="absolute inset-0 bg-ink/20"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                />
                <aside className="cortex-rail absolute left-3 top-3 flex h-[calc(100vh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-80 flex-col rounded-[14px]">
                  <div className="mb-2 flex items-center justify-between px-4 pt-4">
                    <p className="text-[14px] font-semibold text-ink">Menu</p>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-[8px] text-ink-3 hover:bg-hover-2 hover:text-ink"
                      onClick={() => setIsMobileNavOpen(false)}
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {renderNav()}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mx-2 mt-auto mb-3 flex h-8 items-center justify-center gap-1.5 rounded-[8px] bg-hover-2 text-[12.5px] font-medium text-ink"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </aside>
              </div>
            ) : null}
          </main>
        </SessionUserProvider>
      )}
    </AuthGate>
  );
}
