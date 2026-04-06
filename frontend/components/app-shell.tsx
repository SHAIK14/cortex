"use client";

import { AuthGate } from "@/components/auth-gate";
import { SessionUserProvider } from "@/components/session-user";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const NAV_ITEMS = [
  { href: "/chat", label: "Chat" },
  { href: "/memories", label: "Memories" },
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
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileNavOpen(false)}
              className={`block rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? "border border-blue-200 bg-blue-50 font-semibold text-blue-700"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
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
          <main className="flex min-h-screen w-full gap-3 p-3 md:gap-4 md:p-4">
            <aside className="surface hidden h-[calc(100vh-2rem)] w-72 shrink-0 rounded-2xl p-4 md:sticky md:top-4 md:flex md:flex-col">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                Cortex
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                Workspace
              </p>

              <div className="mt-5">{renderNav()}</div>

              <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="truncate text-xs text-slate-500">Signed in as</p>
                <p className="truncate text-sm font-medium text-slate-800">
                  {session.user.email}
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Sign out
                </button>
              </div>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
              <header className="surface flex items-center justify-between rounded-2xl px-4 py-3 md:px-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(true)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 md:hidden"
                    aria-label="Open navigation menu"
                  >
                    ≡
                  </button>
                  <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
                    {pageTitle}
                  </h1>
                </div>
                <p className="hidden text-sm text-slate-500 sm:block">
                  {session.user.email}
                </p>
              </header>

              <div className="min-h-0 flex-1">{children}</div>
            </section>

            {isMobileNavOpen ? (
              <div className="fixed inset-0 z-50 md:hidden">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/20"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                />
                <aside className="surface absolute left-4 top-4 h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-80 rounded-2xl p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-base font-semibold text-slate-900">Menu</p>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  {renderNav()}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
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
