import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <section className="surface relative overflow-hidden rounded-3xl p-6 md:p-10">
        <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />

        <p className="relative font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
          Cortex Platform
        </p>
        <h1 className="relative mt-2 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl md:leading-[1.02]">
          The memory layer that makes your AI chat actually personal.
        </h1>
        <p className="relative mt-4 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
          Cortex stores user context, retrieves relevant facts semantically, and
          injects memory into every response. What you built is now shown
          directly below: live chat intelligence + memory search in one clean
          product flow.
        </p>

        <div className="relative mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-(--accent) px-5 py-3 text-sm font-semibold text-white transition hover:bg-(--accent-strong)"
          >
            Login
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Sign up
          </Link>
          <Link
            href="/chat"
            className="rounded-xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Open app
          </Link>
        </div>

        <div className="relative mt-10 grid gap-4 lg:grid-cols-2">
          <article className="surface-muted overflow-hidden rounded-2xl p-3 md:p-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Chat Experience
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Image
                src="/chat-preview.png"
                alt="Cortex chat page preview"
                width={1400}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </article>

          <article className="surface-muted overflow-hidden rounded-2xl p-3 md:p-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Memory Search
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Image
                src="/memories-preview.png"
                alt="Cortex memories page preview"
                width={1400}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
