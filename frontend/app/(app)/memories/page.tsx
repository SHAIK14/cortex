"use client";

import { useSessionUser } from "@/components/session-user";
import ContextCards, {
  type ContextChunk,
} from "@/components/primitives/ContextCards";
import LoadingState from "@/components/primitives/LoadingState";
import { FormEvent, useCallback, useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8000";

type MemoryResult = {
  memory_text: string;
  score: number;
};

function toChunks(
  results: MemoryResult[],
  mode: "all" | "search",
): ContextChunk[] {
  return results.map((memory, index) => {
    const words = memory.memory_text.trim().split(/\s+/);
    const title = words.slice(0, 6).join(" ") + (words.length > 6 ? "…" : "");
    return {
      title: title || `Memory ${index + 1}`,
      chars: `${memory.memory_text.length} characters`,
      body: memory.memory_text,
      source: mode === "search" ? "Qdrant · search hit" : "Qdrant · saved",
      badge: mode === "search" ? memory.score.toFixed(2) : "MEM",
      tone: mode === "search"
        ? memory.score >= 0.45
          ? "bg-green"
          : "bg-accent"
        : "bg-accent",
    };
  });
}

export default function MemoriesPage() {
  const { accessToken } = useSessionUser();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [allMemories, setAllMemories] = useState<MemoryResult[]>([]);
  const [searchResults, setSearchResults] = useState<MemoryResult[] | null>(
    null,
  );
  const [errorText, setErrorText] = useState("");

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setErrorText("");
    try {
      const response = await fetch(`${API_BASE_URL}/memories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`List failed (${response.status})`);
      }
      const data = (await response.json()) as { memories: MemoryResult[] };
      setAllMemories(data.memories ?? []);
    } catch {
      setAllMemories([]);
      setErrorText("Could not load memories. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isSearching) return;

    setErrorText("");
    setIsSearching(true);

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
      setSearchResults(data.memories ?? []);
    } catch {
      setSearchResults([]);
      setErrorText("Search failed. Confirm backend is running and reachable.");
    } finally {
      setIsSearching(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setSearchResults(null);
  }

  const showingSearch = searchResults !== null;
  const display = showingSearch ? searchResults : allMemories;
  const busy = isLoading || isSearching;

  return (
    <section className="cortex-panel h-full min-h-[70vh] p-4 md:p-6">
      <form onSubmit={handleSearch} className="mb-5 flex gap-2">
        <label htmlFor="memory-query" className="sr-only">
          Search memories
        </label>
        <input
          id="memory-query"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search saved memories…"
          className="h-10 flex-1 rounded-[10px] bg-field px-3 text-[13.5px] text-ink shadow-hairline outline-none transition placeholder:text-ink-3 focus:shadow-btn"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="h-10 rounded-[10px] bg-accent px-4 text-[13px] font-semibold text-white transition hover:bg-accent-ink enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSearching ? "Searching…" : "Search"}
        </button>
        {showingSearch ? (
          <button
            type="button"
            onClick={clearSearch}
            className="h-10 rounded-[10px] bg-hover-2 px-4 text-[13px] font-medium text-ink transition hover:bg-line-strong"
          >
            Show all
          </button>
        ) : null}
      </form>

      {errorText ? (
        <p className="mb-3 text-[13px] font-medium text-red">{errorText}</p>
      ) : null}

      {busy ? (
        <LoadingState
          variant="Drive"
          label={isSearching ? "Searching memories" : "Loading memories"}
        />
      ) : null}

      {!busy && display.length === 0 ? (
        <div className="rounded-[12px] bg-inset px-4 py-5 text-[13px] text-ink-2 shadow-hairline">
          {showingSearch
            ? "No related memories found for this query."
            : "No memories yet. Chat a few facts first, wait a few seconds, then refresh this page."}
        </div>
      ) : null}

      {!busy && display.length > 0 ? (
        <ContextCards
          className="max-w-3xl"
          chunks={toChunks(display, showingSearch ? "search" : "all")}
          labels={{
            header: showingSearch ? "Search results" : "Your memories",
            count: String(display.length),
          }}
        />
      ) : null}
    </section>
  );
}
