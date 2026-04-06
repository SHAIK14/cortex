"use client";

import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthGateProps = {
  children: (session: Session) => React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (!data.session?.user) {
        router.replace("/login");
        return;
      }

      setSession(data.session);
      setIsChecking(false);
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setSession(null);
        router.replace("/login");
        return;
      }

      setSession(session);
      setIsChecking(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isChecking || !session) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
        <div className="surface rounded-2xl px-6 py-4 text-sm text-slate-600">
          Checking session...
        </div>
      </main>
    );
  }

  return <>{children(session)}</>;
}
