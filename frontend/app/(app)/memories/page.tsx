"use client";

import { useSessionUser } from "@/components/session-user";
import { FormEvent, useState } from "react";

const API_BASE_URL = "http://localhost:8000";

type MemoryResult = {
  memory_text: string;
  score: number;
};

export default function MemoriesPage() {
  const { accessToken } = useSessionUser();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [errorText, setErrorText] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isSearching) return;

    setErrorText("");
    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(`${API_BASE_URL}/memories/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: trimmedQuery,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed (${response.status})`);
      }

      const data = (await response.json()) as { memories: MemoryResult[] };
      setResults(data.memories ?? []);
    } catch {
      setResults([]);
      setErrorText("Search failed. Confirm backend is running and reachable.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <section className="surface h-full min-h-[70vh] rounded-2xl p-4 md:p-6">
      <form onSubmit={handleSearch} className="mb-5 flex gap-3">
        <label htmlFor="memory-query" className="sr-only">
          Search memories
        </label>
        <input
          id="memory-query"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. where does the user live?"
          className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-(--accent) md:text-[15px]"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="h-11 rounded-xl bg-(--accent) px-5 text-sm font-semibold text-white transition hover:bg-(--accent-strong) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      {errorText ? (
        <p className="mb-3 text-sm font-medium text-(--danger)">{errorText}</p>
      ) : null}

      {!hasSearched ? (
        <p className="surface-muted rounded-2xl p-6 text-sm text-slate-600">
          Search to see relevant memories and confidence scores.
        </p>
      ) : null}

      {hasSearched && results.length === 0 && !errorText ? (
        <p className="surface-muted rounded-2xl p-6 text-sm text-slate-600">
          No related memories found for this query.
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((memory, index) => (
            <article
              key={`${memory.memory_text}-${index}`}
              className="surface-muted rounded-2xl p-4"
            >
              <p className="mb-3 text-sm leading-relaxed text-slate-900">
                {memory.memory_text}
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500">
                Similarity: {memory.score.toFixed(3)}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
