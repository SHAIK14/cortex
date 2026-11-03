"use client";

import { CortexMark } from "@/components/cortex-mark";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") {
      setMode("signup");
    }
  }, []);

  useEffect(() => {
    async function redirectIfAuthenticated() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        router.replace("/chat");
      }
    }

    void redirectIfAuthenticated();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorText("");
    setNotice("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) throw error;

        setNotice(
          "Account created. If email confirmation is enabled, confirm your email and then sign in.",
        );
        setMode("signin");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;
      router.replace("/chat");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed.";
      setErrorText(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-12">
      <section className="w-full rounded-[18px] bg-surface p-6 shadow-raised md:p-8">
        <div className="mb-5 flex items-center gap-2.5">
          <CortexMark size={32} />
          <div>
            <p className="text-[14px] font-semibold text-ink">Cortex</p>
            <p className="text-[11.5px] text-ink-3">Memory-aware chat</p>
          </div>
        </div>

        <h1 className="text-[22px] font-semibold tracking-tight text-ink">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-[13px] text-ink-2">
          Sign in to continue your memory-aware conversations.
        </p>

        <div className="mt-5 inline-flex rounded-[10px] bg-inset p-1 shadow-hairline">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-[8px] px-3.5 py-1.5 text-[12.5px] font-medium transition ${
              mode === "signin"
                ? "bg-surface text-accent-ink shadow-btn"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-[8px] px-3.5 py-1.5 text-[12.5px] font-medium transition ${
              mode === "signup"
                ? "bg-surface text-accent-ink shadow-btn"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-[12.5px] font-medium text-ink-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 w-full rounded-[10px] bg-field px-3 text-[13.5px] text-ink shadow-hairline outline-none transition placeholder:text-ink-3 focus:shadow-btn"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-[12.5px] font-medium text-ink-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 w-full rounded-[10px] bg-field px-3 pr-10 text-[13.5px] text-ink shadow-hairline outline-none transition placeholder:text-ink-3 focus:shadow-btn"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-[7px] text-ink-3 transition hover:bg-hover-2 hover:text-accent-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-[10px] bg-accent text-[13px] font-semibold text-white transition hover:bg-accent-ink enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        {notice ? (
          <p className="mt-4 rounded-[10px] bg-green-tint px-3 py-2 text-[12.5px] text-green">
            {notice}
          </p>
        ) : null}

        {errorText ? (
          <p className="mt-4 rounded-[10px] bg-red-tint px-3 py-2 text-[12.5px] text-red">
            {errorText}
          </p>
        ) : null}
      </section>
    </main>
  );
}
