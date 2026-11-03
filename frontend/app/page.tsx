import { CortexMark } from "@/components/cortex-mark";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-12 md:px-8">
      <section className="rounded-[22px] bg-surface p-7 shadow-raised md:p-12">
        <div className="mb-6 flex items-center gap-2.5">
          <CortexMark size={36} />
          <p className="text-[15px] font-semibold text-ink">Cortex</p>
        </div>

        <h1 className="max-w-3xl text-[34px] font-semibold tracking-tight text-ink md:text-[48px] md:leading-[1.05]">
          The memory layer that makes AI chat personal.
        </h1>
        <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-2 md:text-[16px]">
          Extract atomic facts, reconcile them in Qdrant, and inject the right
          context into every answer — scoped to the signed-in user.
        </p>

        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-[10px] bg-accent px-4 text-[13px] font-semibold text-white transition hover:bg-accent-ink active:scale-[0.98]"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="inline-flex h-10 items-center rounded-[10px] bg-hover-2 px-4 text-[13px] font-semibold text-ink transition hover:bg-line-strong active:scale-[0.98]"
          >
            Create account
          </Link>
          <Link
            href="/chat"
            className="inline-flex h-10 items-center rounded-[10px] px-4 text-[13px] font-medium text-ink-2 transition hover:bg-hover-2 hover:text-ink"
          >
            Open app
          </Link>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Extract",
              body: "Conversations become atomic facts, not chat blobs.",
            },
            {
              title: "Reconcile",
              body: "Add, update, delete, or skip — contradictions get cleaned up.",
            },
            {
              title: "Recall",
              body: "User-scoped vector search feeds the next answer.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[14px] bg-inset p-4 shadow-hairline"
            >
              <p className="text-[13px] font-semibold text-ink">{item.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
